import { webp, type ImageAsset } from './types.ts'

export type ServiceIconName =
  | 'shopping-bag'
  | 'layout-dashboard'
  | 'monitor'
  | 'bot'
  | 'workflow'
  | 'database'
  | 'cloud'
  | 'palette'

export interface Service {
  slug: string
  title: string
  /** One line for cards and the footer. */
  summary: string
  bullets: string[]
  /** "What you get" line on the services page. */
  outcome: string
  icon: ServiceIconName
  /** Technology groups (labels from technologies.ts) shown as "Tools we use". */
  stackGroups: string[]
  /** Screenshot from a real project that shows this service. Icon panel when absent. */
  example?: { image: ImageAsset; projectSlug: string }
}

export const services: Service[] = [
  {
    slug: 'e-commerce',
    title: 'E-commerce & Product Customization',
    summary:
      'Online stores and interactive product configurators, from custom tailoring to Shopify.',
    bullets: [
      'Custom E-commerce Websites & Online Stores',
      'Interactive Product Configurators',
      'Custom Tailoring & Fashion E-commerce Platforms',
      'Shopify & Digital Product Stores',
    ],
    outcome: 'A working store or configurator, from product data and checkout to live deployment.',
    icon: 'shopping-bag',
    stackGroups: ['Frontend', 'Backend', 'Databases'],
    example: {
      image: webp(
        'work/customtailor-preview',
        'CustomTailor.store suit configurator with live fabric preview',
        1600,
        1000,
      ),
      projectSlug: 'customtailor',
    },
  },
  {
    slug: 'web-apps',
    title: 'Web Apps, SaaS & Enterprise Software',
    summary: 'Custom web apps, SaaS platforms, MVPs, dashboards and business systems.',
    bullets: [
      'Custom Web Apps & SaaS Platforms',
      'Startup MVPs',
      'CRM, Admin Dashboards & Client Portals',
      'Enterprise Software for Companies',
      'Business Management Systems',
    ],
    outcome:
      'A production-ready application, with the code in your repository and a documented handover.',
    icon: 'layout-dashboard',
    stackGroups: ['Frontend', 'Backend', 'Databases'],
  },
  {
    slug: 'websites',
    title: 'Website Development',
    summary: 'Responsive business websites, redesigns, SEO and ongoing maintenance.',
    bullets: [
      'Business Websites',
      'Responsive Frontend & Backend Development',
      'Website Redesign, SEO & Maintenance',
    ],
    outcome: 'A responsive, maintainable website with solid on-page SEO foundations.',
    icon: 'monitor',
    stackGroups: ['Frontend', 'Additional'],
    example: {
      image: webp('work/customtailor-home', 'CustomTailor.store homepage', 1600, 1000),
      projectSlug: 'customtailor',
    },
  },
  {
    slug: 'ai-chatbots',
    title: 'AI Chatbots & LLM Integration',
    summary: 'Support chatbots, knowledge-base assistants and AI features for your web app.',
    bullets: [
      'Website & Customer-Support Chatbots',
      'Knowledge-Base Assistants (RAG)',
      'AI Features for Existing Web Apps',
    ],
    outcome: 'A chatbot or AI feature connected to your content and deployed where you need it.',
    icon: 'bot',
    stackGroups: ['AI & Automation', 'Backend'],
  },
  {
    slug: 'automation',
    title: 'Workflow Automation & API Integration',
    summary: 'n8n, Zapier and Make workflows, APIs, webhooks and third-party integrations.',
    bullets: [
      'n8n, Zapier & Make Automations',
      'REST & GraphQL APIs',
      'Webhooks, Payment & Third-Party Integrations',
    ],
    outcome: 'Automated workflows and integrations that connect the tools you already use.',
    icon: 'workflow',
    stackGroups: ['AI & Automation', 'Additional'],
  },
  {
    slug: 'database',
    title: 'Database Design & Management',
    summary: 'Schema design, migrations, query tuning and automated backups.',
    bullets: [
      'Schema Design, Migrations & Query Tuning',
      'PostgreSQL, MySQL, MongoDB & Redis',
      'Automated Backups & Recovery',
    ],
    outcome: 'A well-structured database with migrations, tuned queries and tested backups.',
    icon: 'database',
    stackGroups: ['Databases', 'Backend'],
  },
  {
    slug: 'cloud',
    title: 'Cloud, VPS & Deployment',
    summary: 'Server setup, Docker, CI/CD, SSL, uptime monitoring and hosting.',
    bullets: [
      'Ubuntu VPS & Cloud Server Setup',
      'Docker, CI/CD, SSL & Uptime Monitoring',
      'Ongoing Hosting & Maintenance',
    ],
    outcome: 'A secured, monitored server with automated deployments and SSL.',
    icon: 'cloud',
    stackGroups: ['Infrastructure'],
  },
  {
    slug: 'design',
    title: 'Graphic Design & Product Visualization',
    summary: 'PSD apparel mockups, smart object templates and product imagery.',
    bullets: [
      'Professional PSD Apparel Mockups',
      'Photoshop Smart Object Templates',
      'Product Image Editing & Branding Assets',
    ],
    outcome: 'Ready-to-use design files and product images for your store or brand.',
    icon: 'palette',
    stackGroups: ['Design'],
    example: {
      image: webp(
        'work/shirtsmockup-product',
        'Apparel PSD mockup product page on ShirtsMockup Store',
        1600,
        1000,
      ),
      projectSlug: 'shirtsmockup',
    },
  },
]

export function getService(slug: string | null | undefined): Service | undefined {
  return services.find((s) => s.slug === slug)
}

/** Path of a service's own page. */
export const servicePath = (slug: string): string => `/services/${slug}`
