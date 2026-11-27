import { LazyMotion } from 'framer-motion'
import type { ReactNode } from 'react'

const loadLayoutFeatures = () => import('./layout-features').then((mod) => mod.default)

/**
 * Wrap elements that use `layout` or `layoutId`. The extra features arrive in a separate
 * chunk after first paint; until then the elements render statically.
 */
export function LayoutFeatures({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadLayoutFeatures} strict>
      {children}
    </LazyMotion>
  )
}
