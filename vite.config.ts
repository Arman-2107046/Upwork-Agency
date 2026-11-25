import { writeFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/**
 * Generates public/robots.txt and public/sitemap.xml from the site config and project data,
 * and injects the default SEO tags + Organization JSON-LD into index.html.
 * Everything comes from src/config/site.ts so there is a single source of truth.
 */
function seoFiles(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  const load = async () => {
    const { createSiteConfig } = await import('./src/config/site.ts')
    const { staticRoutes } = await import('./src/config/routes.ts')
    const { projects } = await import('./src/data/projects.ts')
    const { services } = await import('./src/data/services.ts')
    return { site: createSiteConfig(env), staticRoutes, projects, services }
  }

  return {
    name: 'site-seo-files',
    async buildStart() {
      const { site, staticRoutes, projects, services } = await load()
      const routes = [
        ...staticRoutes,
        ...services.map((s) => `/services/${s.slug}`),
        ...projects.map((p) => `/work/${p.slug}`),
      ]
      const today = new Date().toISOString().slice(0, 10)
      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...routes.map(
          (r) =>
            `  <url><loc>${site.siteUrl}${r === '/' ? '/' : r}</loc><lastmod>${today}</lastmod></url>`,
        ),
        '</urlset>',
        '',
      ].join('\n')
      const robots = `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`
      writeFileSync(new URL('./public/sitemap.xml', import.meta.url), sitemap)
      writeFileSync(new URL('./public/robots.txt', import.meta.url), robots)
    },
    async transformIndexHtml(html) {
      const { site } = await load()
      const title = `${site.brandName} | Web Development, E-commerce & AI Automation`
      const description =
        'Websites, e-commerce, product configurators, SaaS, AI chatbots and workflow automation, designed and built end to end.'
      const org = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: site.brandName,
        url: `${site.siteUrl}/`,
        logo: `${site.siteUrl}/apple-touch-icon.png`,
        description: site.description,
        ...(site.email ? { email: site.email } : {}),
        sameAs: [site.upworkUrl, ...site.social.map((s) => s.href)].filter(Boolean),
      }
      const esc = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
      return html
        .replace(/%BRAND%/g, esc(site.brandName))
        .replace(/%TITLE%/g, esc(title))
        .replace(/%DESCRIPTION%/g, esc(description))
        .replace(/%SITE_URL%/g, site.siteUrl)
        .replace(/%THEME_COLOR%/g, site.themeColor)
        .replace(
          '<!--ORG_JSON_LD-->',
          `<script type="application/ld+json">${JSON.stringify(org).replace(/</g, '\\u003c')}</script>`,
        )
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), seoFiles(mode)],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
  },
}))
