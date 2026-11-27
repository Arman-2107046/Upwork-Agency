import { m } from 'framer-motion'
import type { ReactNode } from 'react'
import { revealVariants, inViewOptions, type Direction } from './variants'
import { useMotionPreference } from './useMotionPreference'

const tags = { div: m.div, li: m.li, p: m.p, span: m.span, section: m.section, article: m.article }

export interface RevealProps {
  children: ReactNode
  as?: keyof typeof tags
  direction?: Direction
  /** px, default 48 */
  distance?: number
  delay?: number
  duration?: number
  className?: string
  /** Fraction of the element that must be visible; use 'some' for very tall blocks. */
  amount?: number | 'some'
  /** Animate on mount instead of on scroll into view (above-the-fold content). */
  onMount?: boolean
}

/** Fades and slides content in once when it scrolls into view. Opacity + transform only. */
export function Reveal({
  children,
  as = 'div',
  direction = 'up',
  distance,
  delay,
  duration,
  className,
  amount,
  onMount = false,
}: RevealProps) {
  const pref = useMotionPreference()
  const Tag = tags[as] as typeof m.div
  const variants = revealVariants(pref, { direction, distance, delay, duration })
  return (
    <Tag
      className={className}
      variants={variants}
      initial="hidden"
      {...(onMount
        ? { animate: 'show' }
        : { whileInView: 'show', viewport: inViewOptions(amount) })}
    >
      {children}
    </Tag>
  )
}
