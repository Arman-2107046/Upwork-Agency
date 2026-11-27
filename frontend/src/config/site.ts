/**
 * Brand-level settings, edited in the admin (Settings > Site settings) and delivered with the
 * page by the backend. Every component reads from this object.
 */
import { getContent } from '@/content/load'
import type { SocialLink } from '@/content/types'

export type { SocialLink }

export const site = {
  ...getContent().site,
  /** The backend endpoint that stores contact form messages and emails the team. */
  contactEndpoint: '/api/contact',
}

export type Site = typeof site

/** Builds an absolute URL from a route path. */
export function absoluteUrl(path = '/'): string {
  return `${site.siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}
