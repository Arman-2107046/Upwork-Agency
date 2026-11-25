import type { Transition, Variants } from 'framer-motion'
import { distance as distanceTokens, duration, ease, viewport } from './tokens'
import type { MotionPreference } from './useMotionPreference'

/** Direction of travel: "up" starts below and moves up, "left" starts right and moves left. */
export type Direction = 'up' | 'down' | 'left' | 'right'

export function offsetFor(direction: Direction, distance: number): { x: number; y: number } {
  switch (direction) {
    case 'up':
      return { x: 0, y: distance }
    case 'down':
      return { x: 0, y: -distance }
    case 'left':
      return { x: distance, y: 0 }
    case 'right':
      return { x: -distance, y: 0 }
  }
}

export const reducedTransition: Transition = { duration: duration.reducedFade, ease: 'linear' }

/** Variants for one revealing element, or a plain 150ms fade under reduced motion. */
export function revealVariants(
  pref: MotionPreference,
  {
    direction = 'up',
    distance = distanceTokens.reveal,
    delay = 0,
    duration: d = duration.reveal,
  }: { direction?: Direction; distance?: number; delay?: number; duration?: number } = {},
): Variants {
  if (pref === 'reduced') {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { ...reducedTransition, delay: Math.min(delay, 0.1) } },
    }
  }
  const { x, y } = offsetFor(direction, distance)
  return {
    hidden: { opacity: 0, x, y },
    show: { opacity: 1, x: 0, y: 0, transition: { duration: d, ease: ease.outExpo, delay } },
  }
}

export function inViewOptions(amount: number | 'some' | 'all' = viewport.amount) {
  return { once: viewport.once, amount, margin: viewport.margin }
}
