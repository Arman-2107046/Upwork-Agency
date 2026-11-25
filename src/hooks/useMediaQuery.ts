import { useSyncExternalStore } from 'react'

/** Subscribes to a CSS media query. Safe to read during the first render (CSR). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Desktop pointer that can hover (mouse or trackpad). */
export const FINE_POINTER = '(hover: hover) and (pointer: fine)'
/** Layouts that can host pinned / horizontal scroll sections. */
export const DESKTOP = '(min-width: 1024px)'
/** Wide and tall enough for pinned (sticky) scroll sections. */
export const PINNED = '(min-width: 1024px) and (min-height: 680px)'
