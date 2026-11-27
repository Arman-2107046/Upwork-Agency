import { getContent } from '@/content/load'
import type { TechGroup } from '@/content/types'

export type { TechGroup }

const content = getContent()

/** Technology groups (Content > Technologies). */
export const technologyGroups: TechGroup[] = content.technologyGroups

/** Chips shown in the home hero (Pages > Home page > Hero). */
export const heroTech: string[] = content.home.heroTech

/** Rows of the logo slider under the hero. */
export const sliderRows: TechGroup[] = content.sliderRows

/** Every technology once, for the marquee. */
export const allTechnologies: string[] = [...new Set(technologyGroups.flatMap((g) => g.items))]
