import type Lenis from 'lenis'

const HEADER_OFFSET = 96

/** Jumps to the top instantly (used on route changes). */
export function scrollToTop(lenis: Lenis | null): void {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}

/** Scrolls to an element by id and moves focus to it for keyboard and screen reader users. */
export function scrollToId(id: string, lenis: Lenis | null, smooth: boolean): boolean {
  const el = document.getElementById(id)
  if (!el) return false
  if (lenis && smooth) {
    lenis.scrollTo(el, { offset: -HEADER_OFFSET })
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
    window.scrollTo({ top, behavior: smooth ? 'smooth' : 'instant' })
  }
  const focusTarget = el.querySelector<HTMLElement>('h2, h3') ?? el
  if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1')
  focusTarget.focus({ preventScroll: true })
  return true
}
