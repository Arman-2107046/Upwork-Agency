import { getContent } from '@/content/load'

const { home } = getContent()

/** Home hero copy (Pages > Home page > Hero). */
export const hero = home.hero

export const finalCta: string = home.finalCta
