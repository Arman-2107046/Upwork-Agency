import { getContent } from '@/content/load'

/** "Why us" reasons (Pages > Home page > Why us). Claim-dependent ones are filtered by the backend. */
export const whyItems: string[] = getContent().home.whyItems
