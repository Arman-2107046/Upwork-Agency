import { getContent } from '@/content/load'
import type { PageKey, PageSeo } from '@/content/types'

/** Search titles and descriptions of the fixed pages (Settings > SEO). */
export const pageSeo: Record<PageKey, PageSeo> = getContent().pages
