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
  {
    slug: 'amidx',
    title: 'AmidX Technologies',
    url: 'https://amidx.net',
    overview:
      'The website of AmidX Technologies, a digital engineering company: twelve solution areas from web and app development to AI and cybersecurity, industry pages, a portfolio, a blog, pricing and client accounts.',
    category: 'Software company website',
    scope: [
      'Solutions catalogue',
      'Industry pages',
      'Portfolio and blog',
      'Pricing',
      'Login and registration',
    ],
    // TODO: add the confirmed technology stack for this project.
    technologies: [],
    cover: webp('work/amidx-home', 'AmidX Technologies homepage', 1600, 1000),
    gallery: [
      webp('work/amidx-solutions', 'Solutions list with numbered service areas', 1600, 1000),
      webp('work/amidx-industries', 'Industry section in a dark grid layout', 1600, 1000),
      webp('work/amidx-mobile', 'The site on mobile: homepage and solutions', 1600, 1000),
    ],
  },
  {
    slug: 'amidventure',
    title: 'Amid Venture',
    url: 'https://www.amidventure.com',
    overview:
      'The corporate website of Amid Venture, a group working across apparel, food, agriculture, accessories, IT and real estate: business divisions, apparel sourcing and product categories, sustainability pages and office locations, in English, Spanish and Japanese.',
    category: 'Corporate group website',
    scope: [
      'Business division showcase',
      'Apparel sourcing and product categories',
      'Sustainability pages',
      'Multilingual content',
      'Office locations and contact',
    ],
    // TODO: add the confirmed technology stack for this project.
    technologies: [],
    cover: webp('work/amidventure-home', 'Amid Venture homepage hero', 1600, 1000),
    gallery: [
      webp(
        'work/amidventure-businesses',
        "Introduction and the group's business divisions",
        1600,
        1000,
      ),
      webp('work/amidventure-sourcing', 'Amid Sourcing section with apparel imagery', 1440, 900),
      webp(
        'work/amidventure-mobile',
        'The site on mobile: homepage and product categories',
        1600,
        1000,
      ),
    ],
  },
  {
    slug: 'avalon',
    title: 'Avalon Technology Ltd',
    url: 'https://avatechbd.com',
    overview:
      'The website of Avalon Technology Ltd, an enterprise IT services company: cybersecurity, cloud and infrastructure, networking, software and IT support services, industry sectors, a client showcase and careers.',
    category: 'IT services company website',
    scope: ['Service catalogue', 'Industry sectors', 'Client showcase', 'Careers', 'Contact'],
    // TODO: add the confirmed technology stack for this project.
    technologies: [],
    cover: webp('work/avalon-home', 'Avalon Technology homepage', 1600, 1000),
    gallery: [
      webp('work/avalon-services', 'Enterprise technology services grid', 1600, 1000),
      webp('work/avalon-clients', 'Client logo showcase', 1440, 900),
      webp('work/avalon-mobile', 'The site on mobile: homepage and services', 1600, 1000),
    ],
  },
  {
    slug: 'icepeak',
    title: 'Ice Peak Design Limited',
    url: 'https://icepeakbd.com',
    overview:
      'The website of Ice Peak Design Limited, an apparel sourcing company in Bangladesh: a production line of twelve garment categories, research, design and production services, international office locations and a blog.',
    category: 'Apparel sourcing company website',
    scope: [
      'Production line catalogue',
      'Service overview',
      'International office locations',
      'Company and management pages',
      'Blog',
    ],
    // TODO: add the confirmed technology stack for this project.
    technologies: [],
    cover: webp('work/icepeak-home', 'Ice Peak Design Limited homepage', 1600, 1000),
    gallery: [
      webp('work/icepeak-production', 'Production line grid of garment categories', 1600, 1000),
      webp('work/icepeak-offices', 'International office locations', 1600, 1000),
      webp('work/icepeak-mobile', 'The site on mobile: homepage and knitwear page', 1600, 1000),
    ],
  },
  {
    slug: 'soundgraphic',
    title: 'Sound Graphic Accessories',
    url: 'https://soundgraphicaccessories.com',
    overview:
      'The website of Sound Graphic Accessories, a garments accessories manufacturer in Bangladesh: production capabilities, a product catalogue of hangtags, labels, elastics and threads, facilities, clients and quote requests.',
    category: 'Manufacturer website',
    scope: [
      'Product catalogue',
      'Production capabilities',
      'Facilities',
      'Client showcase',
      'Quote requests',
    ],
    // TODO: add the confirmed technology stack for this project.
    technologies: [],
    cover: webp('work/soundgraphic-home', 'Sound Graphic Accessories homepage', 1600, 1000),
    gallery: [
      webp(
        'work/soundgraphic-capabilities',
        'Production capabilities with factory photography',
        1600,
        1000,
      ),
      webp(
        'work/soundgraphic-products',
        'Products page with hangtag and sticker items',
        1600,
        1000,
      ),
      webp('work/soundgraphic-mobile', 'The site on mobile: homepage and products', 1600, 1000),
    ],
  },
]

/** Projects shown in the home page gallery. Slice this list to feature fewer. */
export const featuredProjects: Project[] = projects

export function getProject(slug: string | undefined): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
