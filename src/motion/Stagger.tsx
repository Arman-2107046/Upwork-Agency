import { m, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { stagger as staggers } from './tokens'
import { inViewOptions, revealVariants, type Direction } from './variants'
import { useMotionPreference } from './useMotionPreference'

const tags = { div: m.div, ul: m.ul, ol: m.ol, li: m.li, span: m.span, dl: m.dl }

export interface StaggerProps {
  children: ReactNode
  as?: keyof typeof tags
  className?: string
  /** Seconds between children, default tokens.stagger.items */
  stagger?: number
  delay?: number
  amount?: number | 'some'
  onMount?: boolean
  'aria-label'?: string
}

/** Parent that sequences its <StaggerItem> children through variants. */
export function Stagger({
  children,
  as = 'div',
  className,
  stagger = staggers.items,
  delay = 0,
  amount = 'some',
  onMount = false,
  'aria-label': ariaLabel,
}: StaggerProps) {
  const pref = useMotionPreference()
  const Tag = tags[as] as typeof m.div
  const variants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: pref === 'reduced' ? 0 : stagger,
        delayChildren: pref === 'reduced' ? 0 : delay,
      },
    },
  }
  return (
    <Tag
      aria-label={ariaLabel}
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

export interface StaggerItemProps {
  children: ReactNode
  as?: keyof typeof tags
  className?: string
  direction?: Direction
  distance?: number
  duration?: number
}

export function StaggerItem({
  children,
  as = 'div',
  className,
  direction = 'up',
  distance,
  duration,
}: StaggerItemProps) {
  const pref = useMotionPreference()
  const Tag = tags[as] as typeof m.div
  return (
    <Tag className={className} variants={revealVariants(pref, { direction, distance, duration })}>
      {children}
    </Tag>
  )
}
