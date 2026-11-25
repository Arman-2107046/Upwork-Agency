import { site } from '@/config/site'

const years = site.claims.yearsExperience

export const aboutStatement = `${site.brandName} is a multidisciplinary design and development agency combining ${
  years ? `${years} years of ` : ''
}creative design expertise with modern web development. Our team includes graphic designers, frontend developers, and backend developers.`

export const intro =
  'We design, develop, and deliver professional websites, e-commerce platforms, interactive product configurators, SaaS applications, enterprise software, AI chatbots, and workflow automation, from database to live deployment.'

export const closingLine = "Let's build something exceptional together!"

export const howWeWork = [
  {
    title: 'Scoped milestones',
    text: 'Work is split into clear milestones with agreed deliverables.',
  },
  {
    title: 'Regular progress updates',
    text: 'You see progress as it happens, not only at the end.',
  },
  {
    title: 'Code in your repository',
    text: 'Source code lives in your repository from the first commit.',
  },
  {
    title: 'Documented handover',
    text: 'You receive documentation so your team can run and extend the project.',
  },
]

export const teamRoles = [
  {
    title: 'Graphic designers',
    text: 'Brand assets, apparel mockups, product imagery and interface design.',
  },
  {
    title: 'Frontend developers',
    text: 'Responsive interfaces, configurators and web app front ends.',
  },
  {
    title: 'Backend developers',
    text: 'APIs, databases, integrations, automation and deployment.',
  },
]
