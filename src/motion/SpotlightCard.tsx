import { m, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import type { PointerEvent, ReactNode } from 'react'
import { FINE_POINTER, useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/cn'
import { distance, spring } from './tokens'
import { useMotionPreference } from './useMotionPreference'

const tags = { div: m.div, article: m.article, li: m.li }

export interface SpotlightCardProps {
  children: ReactNode
  className?: string
  as?: keyof typeof tags
  /** Tilt toward the pointer (max tokens.distance.tiltDeg). Off for cards in a shared-border grid. */
  tilt?: boolean
  /** "card": own border and surface. "cell": no border or background, for shared-border grids. */
  variant?: 'card' | 'cell'
}

/**
 * Card with a soft radial highlight that follows the pointer and a subtle 3D tilt
 * (max 4deg). Touch devices and reduced motion get a simple CSS lift instead.
 */
export function SpotlightCard({
  children,
  className,
  as = 'div',
  tilt = true,
  variant = 'card',
}: SpotlightCardProps) {
  const pref = useMotionPreference()
  const fine = useMediaQuery(FINE_POINTER)
  const interactive = pref === 'full' && fine
  const Tag = tags[as] as typeof m.div

  const px = useMotionValue(-999)
  const py = useMotionValue(-999)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const rotateX = useSpring(rx, spring.soft)
  const rotateY = useSpring(ry, spring.soft)
  const glow = useMotionTemplate`radial-gradient(420px circle at ${px}px ${py}px, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%)`

  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (!interactive || e.pointerType !== 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    px.set(x)
    py.set(y)
    if (!tilt) return
    ry.set(((x / rect.width) * 2 - 1) * distance.tiltDeg)
    rx.set(-((y / rect.height) * 2 - 1) * distance.tiltDeg)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
    px.set(-999)
    py.set(-999)
  }

  return (
    <Tag
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={interactive && tilt ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      className={cn(
        'group/spot relative isolate overflow-hidden',
        variant === 'card' && 'border border-line bg-surface',
        !interactive &&
          variant === 'card' &&
          'transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] focus-within:-translate-y-1 hover:-translate-y-1 active:-translate-y-1',
        className,
      )}
    >
      {interactive ? (
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-[var(--dur-base)] group-hover/spot:opacity-100"
          style={{ background: glow }}
        />
      ) : null}
      {children}
    </Tag>
  )
}
