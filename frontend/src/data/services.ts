import { getContent } from '@/content/load'
import type { Service, ServiceIconName } from '@/content/types'

export type { Service, ServiceIconName }

/** Published services in the order set in the admin (Content > Services). */
export const services: Service[] = getContent().services

export function getService(slug: string | null | undefined): Service | undefined {
  return services.find((s) => s.slug === slug)
}

/** Path of a service's own page. */
export const servicePath = (slug: string): string => `/services/${slug}`
