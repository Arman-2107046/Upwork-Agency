import { getContent } from '@/content/load'
import type { Project } from '@/content/types'

export type { Project }

/** Published projects in the order set in the admin (Content > Projects). */
export const projects: Project[] = getContent().projects

/** Projects shown in the home page gallery ("Show on the home page" in the admin). */
export const featuredProjects: Project[] = projects.filter((p) => p.featured)

export function getProject(slug: string | undefined): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
