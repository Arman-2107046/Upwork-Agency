import { absoluteUrl, site } from '@/config/site'
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
