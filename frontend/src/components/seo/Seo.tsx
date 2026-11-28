import { Helmet } from 'react-helmet-async'
import { absoluteUrl, site } from '@/config/site'

export interface SeoProps {
  /** Page title without the brand suffix. Keep title + suffix under 60 characters. */
  title: string
  /** Under 160 characters. */
  description: string
  /** Route path, used for the canonical URL. */
  path: string
  image?: string
  type?: 'website' | 'article'
  noindex?: boolean
  /** Route-level structured data. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
  /** Open Graph article tags (blog posts). */
  article?: {
    publishedTime: string
    modifiedTime?: string
    section: string
    tags: string[]
    author?: string
  }
}

/**
 * Per-route head tags. Kept as one wrapper so the site can move to prerendering or Next.js
 * metadata without touching pages.
 */
export function Seo({
  title,
  description,
  path,
  image = '/og-image.png',
  type = 'website',
  noindex = false,
  jsonLd,
  article,
}: SeoProps) {
  const fullTitle = title.includes(site.brandName) ? title : `${title} | ${site.brandName}`
  const url = absoluteUrl(path)
  const img = image.startsWith('http') ? image : absoluteUrl(image)
  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="theme-color" content={site.themeColor} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={site.brandName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      {image === '/og-image.png' ? <meta property="og:image:width" content="1200" /> : null}
      {image === '/og-image.png' ? <meta property="og:image:height" content="630" /> : null}
      {article ? <meta property="article:published_time" content={article.publishedTime} /> : null}
      {article ? (
        <meta
          property="article:modified_time"
          content={article.modifiedTime ?? article.publishedTime}
        />
      ) : null}
      {article ? <meta property="article:section" content={article.section} /> : null}
      {article?.tags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      {article?.author ? <meta name="author" content={article.author} /> : null}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {jsonLd ? (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, '\\u003c')}
        </script>
      ) : null}
    </Helmet>
  )
}
