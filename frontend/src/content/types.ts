/**
 * Shape of the CMS content the backend sends (backend/app/Content/SiteContent.php).
 * Everything the website shows comes from here; edit it in the admin at /admin.
 */

export interface ImageAsset {
  /** Root-relative URL. Undefined renders a designed placeholder block. */
  src?: string
  alt: string
  width: number
  height: number
  /** Responsive candidates, e.g. "/a-800.webp 800w, /a.webp 1600w". */
  srcSet?: string
  /** Short caption shown on the placeholder until a real image is supplied. */
  placeholderLabel?: string
}

export interface VideoAsset {
  /** Video file uploaded in the admin. */
  src: string
  poster?: string
  title: string
  width: number
  height: number
}

export interface SocialLink {
  label: string
  href: string
}

export interface SiteSettings {
  brandName: string
  /** Short form for tight spaces (manifest short_name, monogram). */
  shortName: string
  /** Terminal-style prompt shown above page headings. */
  handle: string
  tagline: string
  description: string
  /** Public URL of the site, no trailing slash (the backend's APP_URL). */
  siteUrl: string
  /** Empty hides email links. */
  email: string
  /** Empty hides Upwork links. */
  upworkUrl: string
  social: SocialLink[]
  responseTime: string
  /** A claim set to `false` is hidden everywhere. */
  claims: { yearsExperience: string | false; upworkBadge: boolean }
  themeColor: string
}

export interface PageSeo {
  title: string
  description: string
}

export type PageKey = 'home' | 'services' | 'work' | 'blog' | 'about' | 'contact'

export interface TitledText {
  title: string
  text: string
}

export interface ShowcaseStage {
  title: string
  text: string
  image: ImageAsset
  /** Which schematic placeholder to draw while no screenshot exists. */
  sketch: 'fabric' | 'customize' | 'preview' | 'pricing' | 'order'
}

export interface Showcase {
  projectSlug: string
  eyebrow: string
  title: string
  intro: string
  stages: ShowcaseStage[]
}

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
  /** Only technologies confirmed for this project. The section hides when empty. */
  technologies: string[]
  cover: ImageAsset
  gallery: ImageAsset[]
  /** Optional walkthrough video, shown on the project page. */
  video?: VideoAsset
  /** Shown in the home page gallery. */
  featured: boolean
}

export type ServiceIconName =
  | 'shopping-bag'
  | 'layout-dashboard'
  | 'monitor'
  | 'bot'
  | 'workflow'
  | 'database'
  | 'cloud'
  | 'palette'
  | 'pen-tool'

export interface Service {
  slug: string
  title: string
  /** One line for cards and the footer. */
  summary: string
  bullets: string[]
  /** "What you get" line on the services page. */
  outcome: string
  icon: ServiceIconName
  /** Technology group labels shown as "Tools we use". */
  stackGroups: string[]
  /** Screenshot from a real project that shows this service. Icon panel when absent. */
  example?: { image: ImageAsset; projectSlug?: string }
}

export interface TechGroup {
  label: string
  items: string[]
}

export interface PostAuthor {
  name: string
  role?: string
  bio?: string
  avatar?: ImageAsset
}

/** A blog post as listed on cards (ships with every page). */
export interface PostSummary {
  slug: string
  title: string
  /** One or two sentences, also the search description. */
  excerpt: string
  category: string
  categorySlug: string
  tags: string[]
  /** The uploaded cover, else the first image in the article (no src: a branded placeholder). */
  cover: ImageAsset
  /** Caption or credit shown under the cover. */
  coverCaption?: string
  /** ISO 8601. */
  publishedAt: string
  updatedAt?: string
  readingMinutes: number
  featured: boolean
  author?: PostAuthor
}

/** A blog category with live posts (Content > Blog posts > Categories in the admin). */
export interface BlogCategory {
  slug: string
  name: string
  /** Shown at the top of the category page. */
  description?: string
  seoTitle?: string
  seoDescription?: string
  /** Live posts in the category. */
  count: number
}

export interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

/** A blog post with its body, loaded by the post page. */
export interface Post extends PostSummary {
  /** Sanitized article HTML; h2/h3 carry the ids listed in `toc`. */
  html: string
  toc: TocItem[]
  seoTitle: string
  seoDescription: string
  /** The generated 1200×630 link preview card (root-relative). */
  shareImage?: string
  /** True for drafts and scheduled posts opened through an admin preview link. */
  draft: boolean
  /** Approved comments, oldest first. */
  comments: PostCommentItem[]
}

export interface PostCommentItem {
  id: number
  name: string
  body: string
  /** ISO 8601. */
  date: string
}

/** Home page "Deployment & Maintenance" section (Pages > Home page > Deployment). */
export interface Deployment {
  eyebrow: string
  title: string
  intro: string
  /** Logo groups; never empty groups. The section is hidden when there are none. */
  platformGroups: TechGroup[]
  maintenance: TitledText[]
}

export interface SiteContent {
  site: SiteSettings
  pages: Record<PageKey, PageSeo>
  home: {
    hero: { eyebrow: string; headline: string; sub: string }
    heroTech: string[]
    intro: string
    finalCta: string
    processSteps: TitledText[]
    whyItems: string[]
    showcase: Showcase
    deployment: Deployment
  }
  about: {
    statement: string
    closingLine: string
    howWeWork: TitledText[]
    teamRoles: TitledText[]
  }
  projects: Project[]
  services: Service[]
  technologyGroups: TechGroup[]
  sliderRows: TechGroup[]
  /** Live blog posts, newest first. */
  posts: PostSummary[]
  /** Categories with live posts, in the admin's order. */
  categories: BlogCategory[]
}
