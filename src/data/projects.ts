import { webp, type ImageAsset } from './types.ts'

export interface Project {
  slug: string
  title: string
  /** Public URL of the live project, if it can be linked. */
  url?: string
  /** One-paragraph overview. */
  overview: string
  /** Short label used on cards. */
  category: string
  scope: string[]
  /** Only list technologies confirmed for this project. The section hides when empty. */
  technologies: string[]
  cover: ImageAsset
  gallery: ImageAsset[]
}

export const projects: Project[] = [
  {
    slug: 'customtailor',
    title: 'CustomTailor.store',
    url: 'https://customtailor.store',
    overview:
      'An interactive custom tailoring platform with fabric selection, garment customization, live previews, dynamic pricing, and personalized ordering.',
    category: 'Custom tailoring platform',
    scope: [
      'Fabric selection',
      'Garment customization',
      'Live previews',
      'Dynamic pricing',
      'Personalized ordering',
    ],
    // TODO: add the confirmed technology stack for this project.
    technologies: [],
    cover: webp('work/customtailor-home', 'CustomTailor.store homepage', 1600, 1000),
    gallery: [
      webp(
        'work/customtailor-fabric',
        'Suit configurator with the fabric selection panel open',
        1600,
        1000,
      ),
      webp(
        'work/customtailor-style',
        'Style step: body style, vents and lapel options',
        1600,
        1000,
      ),
      webp(
        'work/customtailor-preview',
        'Live preview of the suit in the selected plaid fabric',
        1600,
        1000,
      ),
    ],
  },
  {
    slug: 'shirtsmockup',
    title: 'ShirtsMockup Store',
    url: 'https://shirtsmockup.com',
    overview:
      'A digital product store featuring professional apparel PSD mockups, organized collections, and a responsive shopping experience.',
    category: 'Digital product store',
    scope: [
      'Digital product store',
      'Apparel PSD mockups',
      'Organized collections',
      'Responsive shopping',
    ],
    // TODO: add the confirmed technology stack for this project.
    technologies: ['Photoshop'],
    cover: webp('work/shirtsmockup-home', 'ShirtsMockup Store homepage', 1600, 1000),
    gallery: [
      webp('work/shirtsmockup-products', 'Product grid of apparel PSD mockups', 1600, 1000),
      webp(
        'work/shirtsmockup-product',
        'Product page with licence options and purchase buttons',
        1600,
        1000,
      ),
      webp(
        'work/shirtsmockup-mobile',
        'The store on mobile: homepage and product page',
        1600,
        1000,
      ),
    ],
  },
]

export function getProject(slug: string | undefined): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
