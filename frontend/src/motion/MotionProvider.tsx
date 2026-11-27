import { domAnimation, LazyMotion, MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Loads only the `domAnimation` feature set (animations, variants, gestures, in-view).
 * Layout animations (layoutId) load on demand through <LayoutFeatures>.
 * Reduced motion is handled explicitly by every primitive through useMotionPreference(),
 * so Framer's own global reduction is disabled to keep one source of truth.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="never">{children}</MotionConfig>
    </LazyMotion>
  )
}
