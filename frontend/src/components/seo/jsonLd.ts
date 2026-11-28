import { absoluteUrl, site } from '@/config/site'
import type { Post } from '@/data/posts'
import { blogPath } from '@/data/posts'
import type { Project } from '@/data/projects'
import { servicePath, type Service } from '@/data/services'

const provider = () => ({
  '@type': 'Organization',
  name: site.brandName,
  url: absoluteUrl('/'),
})

export function serviceJsonLd(s: Service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.title,
    serviceType: s.title,
    description: s.summary,
    url: absoluteUrl(servicePath(s.slug)),
    provider: provider(),
  }
}

export function servicesJsonLd(services: Service[]) {
  return services.map(serviceJsonLd)
}

export function projectJsonLd(project: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.overview,
    url: absoluteUrl(`/work/${project.slug}`),
    ...(project.url ? { sameAs: project.url } : {}),
    keywords: [...project.scope, ...project.technologies].join(', '),
    creator: provider(),
  }
}

export function blogPostingJsonLd(post: Post) {
  const url = absoluteUrl(blogPath(post.slug))
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: url,
    ...(post.cover.src
      ? { image: post.cover.src.startsWith('http') ? post.cover.src : absoluteUrl(post.cover.src) }
      : {}),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    articleSection: post.category,
    ...(post.tags.length ? { keywords: post.tags.join(', ') } : {}),
    author: post.author
      ? {
          '@type': 'Person',
          name: post.author.name,
          ...(post.author.role ? { jobTitle: post.author.role } : {}),
        }
      : provider(),
    publisher: {
      ...provider(),
      logo: { '@type': 'ImageObject', url: absoluteUrl('/apple-touch-icon.png') },
    },
  }
}
