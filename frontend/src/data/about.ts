import { getContent } from '@/content/load'

const { about, home } = getContent()

/** About page copy (Pages > About page). */
export const aboutStatement: string = about.statement

/** The scroll-filled statement on the home page (Pages > Home page). */
export const intro: string = home.intro

/** Shown in the footer on every page. */
export const closingLine: string = about.closingLine

export const howWeWork = about.howWeWork

export const teamRoles = about.teamRoles
