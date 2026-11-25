export interface TechGroup {
  label: string
  items: string[]
}

export const technologyGroups: TechGroup[] = [
  { label: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
  { label: 'Backend', items: ['Node.js', 'Express', 'NestJS', 'Laravel', 'PHP', 'Python'] },
  { label: 'Databases', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
  { label: 'AI & Automation', items: ['LLM APIs', 'n8n', 'Zapier', 'Make'] },
  { label: 'Infrastructure', items: ['Docker', 'Ubuntu VPS', 'CI/CD', 'Cloudflare'] },
  { label: 'Design', items: ['Photoshop', 'Illustrator', 'Blender'] },
  { label: 'Additional', items: ['Three.js', 'APIs', 'SEO'] },
]

/** Chips shown in the home hero. */
export const heroTech = ['React', 'Next.js', 'Laravel', 'Node.js', 'PostgreSQL', 'Docker', 'n8n']

/** Rows of the logo slider under the hero, built from the groups above. */
export const sliderRows: { label: string; items: string[] }[] = [
  { label: 'Applications', groups: ['Frontend', 'Backend'] },
  { label: 'Data and AI', groups: ['Databases', 'AI & Automation'] },
  { label: 'Infrastructure and design', groups: ['Infrastructure', 'Design', 'Additional'] },
].map((row) => ({
  label: row.label,
  items: technologyGroups.filter((g) => row.groups.includes(g.label)).flatMap((g) => g.items),
}))

/** Every technology once, for the marquee. */
export const allTechnologies: string[] = technologyGroups.flatMap((g) => g.items)
