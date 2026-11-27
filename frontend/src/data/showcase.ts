import { getContent } from '@/content/load'
import type { Showcase, ShowcaseStage } from '@/content/types'

export type { ShowcaseStage }

/** Configurator showcase on the home page (Pages > Home page > Configurator showcase). */
export const showcase: Showcase = getContent().home.showcase
