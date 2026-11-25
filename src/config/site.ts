/**
 * Single source of truth for brand-level settings.
 * Edit values here; every component reads from this object.
 *
 * Values marked "env" come from environment variables (see .env.example) so they can
 * differ between local, staging and production without code changes.
 */

type Env = Partial<Record<string, string | boolean | undefined>>

export interface SocialLink {
  label: string
  href: string
}

export function createSiteConfig(env: Env = {}) {
  const readEnv = (key: string): string => {
    const value = env[key]
    return typeof value === 'string' ? value.trim() : ''
  }

  return {
    brandName: 'Bytecode Software Labs',
    /** Short form for tight spaces (manifest short_name, monogram). */
    shortName: 'Bytecode',
    /** Terminal-style prompt shown above page headings. */
    handle: 'bytecode@labs',
    tagline: 'Web Development, E-commerce, AI Automation & Digital Design',
    description:
      'We design, develop, and deliver professional websites, e-commerce platforms, interactive product configurators, SaaS applications, enterprise software, AI chatbots, and workflow automation, from database to live deployment.',

    /** env: VITE_SITE_URL. No trailing slash. TODO: set the real production domain. */
    siteUrl: (readEnv('VITE_SITE_URL') || 'https://www.example.com').replace(/\/+$/, ''),
    /** env: VITE_CONTACT_EMAIL. When empty, email links are hidden. */
    email: readEnv('VITE_CONTACT_EMAIL'),
    /** env: VITE_UPWORK_URL. When empty, Upwork links are hidden. */
    upworkUrl: readEnv('VITE_UPWORK_URL'),
    /** env: VITE_FORM_ENDPOINT. JSON POST endpoint (Formspree or Web3Forms). */
    formEndpoint: readEnv('VITE_FORM_ENDPOINT'),
    /** env: VITE_FORM_ACCESS_KEY. Only needed for Web3Forms. */
    formAccessKey: readEnv('VITE_FORM_ACCESS_KEY'),

    /** Add entries like { label: 'LinkedIn', href: 'https://…' }. Rendered in the footer and JSON-LD. */
    social: [] as SocialLink[],

    responseTime: 'within 24 hours',

    /**
     * Claims shown across the site. Set a value to `false` (or an empty string) to hide it
     * everywhere without touching components.
     */
    claims: {
      yearsExperience: '17+' as string | false,
      upworkBadge: true,
    },

    /** Brand color used for the browser UI (theme-color meta). */
    themeColor: '#FFFFFF',
  } as const
}

// `import.meta.env` is undefined when vite.config.ts imports this file in Node.
export const site = createSiteConfig(
  typeof import.meta.env === 'object' ? (import.meta.env as Env) : {},
)

export type Site = typeof site

/** Builds an absolute URL from a route path. */
export function absoluteUrl(path = '/'): string {
  return `${site.siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}
