import { getContent } from '@/content/load'

const { home } = getContent()

/** Home hero copy (Pages > Home page > Hero). */
export const hero = home.hero

export const finalCta: string = home.finalCta

/** Deployment & Maintenance section (Pages > Home page > Deployment). */
export const deployment = home.deployment

export const showDeployment = deployment.platformGroups.length > 0

/** Section numbers after Technologies (05), which move up by one while Deployment is shown. */
const shift = showDeployment ? 1 : 0
export const sectionIndex = { deployment: 6, work: 6 + shift, why: 7 + shift, posts: 8 + shift }
