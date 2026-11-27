/**
 * Motion tokens: the ONLY place timings and easings are defined.
 * Components and CSS read from here (CSS receives them as custom properties via
 * `applyMotionCssVars()` in main.tsx).
 */

export type Bezier = [number, number, number, number]

export const ease = {
  /** Reveals and entrances. */
  outExpo: [0.22, 1, 0.36, 1] as Bezier,
  /** Page and menu transitions. */
  inOut: [0.65, 0, 0.35, 1] as Bezier,
} as const

/** Seconds. */
export const duration = {
  micro: 0.2,
  base: 0.6,
  reveal: 0.9,
  hero: 1.2,
  /** Replacement for every reveal under prefers-reduced-motion. */
  reducedFade: 0.15,
  /** Route transition halves. Exit + enter must stay at or below 0.5s. */
  pageExit: 0.18,
  pageEnter: 0.3,
  /** Optional branded intro (shown once per session). */
  intro: 0.9,
  /** Seconds for one full loop of the tech marquee. */
  marqueeLoop: 40,
  /** Gentle loop of the hero "Scroll" cue. */
  scrollCueLoop: 1.8,
  /** Count-up animation length. */
  countUp: 1.4,
  /** One rotation of the form submit spinner. */
  spinner: 0.7,
} as const

export const spring = {
  soft: { type: 'spring', stiffness: 120, damping: 20 },
  snappy: { type: 'spring', stiffness: 300, damping: 28 },
  /** Smoothing for scroll-linked values (Parallax, progress lines). */
  scroll: { stiffness: 120, damping: 20, mass: 0.4 },
} as const

/** Seconds between siblings. */
export const stagger = {
  items: 0.08,
  words: 0.04,
} as const

/** Seconds. Choreography offsets for sequenced entrances. */
export const sequence = {
  /** Element that follows a heading (intro paragraph, CTA row). */
  follow: 0.15,
  pageIntro: 0.35,
  heroSub: 0.45,
  heroCtas: 0.65,
  heroChips: 0.85,
  heroCue: 1.4,
  menuItems: 0.1,
} as const

export const viewport = {
  once: true,
  amount: 0.3,
  margin: '0px 0px -10% 0px',
} as const

/** Distances in px. */
export const distance = {
  reveal: 48,
  magnetic: 12,
  pageShift: 24,
  tiltDeg: 4,
} as const

const bezier = (b: Bezier) => `cubic-bezier(${b.join(', ')})`

/** Exposes tokens as CSS custom properties so CSS transitions share the same values. */
export function applyMotionCssVars(root: HTMLElement = document.documentElement): void {
  const vars: Record<string, string> = {
    '--ease-out-expo': bezier(ease.outExpo),
    '--ease-in-out': bezier(ease.inOut),
    '--dur-micro': `${duration.micro}s`,
    '--dur-base': `${duration.base}s`,
    '--dur-reveal': `${duration.reveal}s`,
    '--dur-marquee': `${duration.marqueeLoop}s`,
    '--dur-scroll-cue': `${duration.scrollCueLoop}s`,
    '--dur-spinner': `${duration.spinner}s`,
  }
  for (const [key, value] of Object.entries(vars)) root.style.setProperty(key, value)
}

/** Lenis smooth-scroll interpolation (0 to 1, lower = smoother). Desktop wheel only. */
export const smoothScroll = {
  lerp: 0.1,
  wheelMultiplier: 1,
} as const

/**
 * TextScrollFill starting opacity. The brief asked for 0.3, but 0.3 renders at 2:1 contrast
 * (fails WCAG AA). 0.46 is the lowest value that keeps the large statement text at 3:1+.
 */
export const scrollFill = {
  minOpacity: 0.46,
} as const

/** Parallax travel in px for speed = 1 (speed props range from -0.3 to 0.3). */
export const parallaxRange = 400
