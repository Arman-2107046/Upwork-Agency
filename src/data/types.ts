/** Shared content types. Data files stay free of React so they can be reused anywhere. */

export interface ImageAsset {
  /**
   * Path under /public (for example "/images/work/customtailor-hero.webp").
   * Leave undefined to render a designed placeholder block.
   */
  src?: string
  alt: string
  width: number
  height: number
  /** Responsive candidates, e.g. "/a-800.webp 800w, /a.webp 1600w". */
  srcSet?: string
  /** Short caption shown on the placeholder until a real image is supplied. */
  placeholderLabel?: string
}

/**
 * Builds an ImageAsset for a screenshot stored in /public/images as `<base>.webp`
 * (full width) plus `<base>-800.webp` (small screens).
 */
export function webp(base: string, alt: string, width: number, height: number): ImageAsset {
  return {
    src: `/images/${base}.webp`,
    srcSet: `/images/${base}-800.webp 800w, /images/${base}.webp ${width}w`,
    alt,
    width,
    height,
  }
}
