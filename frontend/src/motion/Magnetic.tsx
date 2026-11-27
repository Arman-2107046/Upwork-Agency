import { m, useMotionValue, useSpring } from 'framer-motion'
import type { PointerEvent, ReactNode } from 'react'
import { FINE_POINTER, useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/cn'
import { distance, spring } from './tokens'
import { useMotionPreference } from './useMotionPreference'

export interface MagneticProps {
  children: ReactNode
  className?: string
  /** Max travel in px (default 12). */
  radius?: number
}

/** Children drift toward the cursor (desktop pointer only), snapping back on leave. */
export function Magnetic({ children, className, radius = distance.magnetic }: MagneticProps) {
  const pref = useMotionPreference()
  const fine = useMediaQuery(FINE_POINTER)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, spring.snappy)
  const sy = useSpring(y, spring.snappy)
  const enabled = pref === 'full' && fine

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabled || e.pointerType !== 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    const len = Math.hypot(dx, dy) || 1
    const k = Math.min(1, len) / len
    x.set(dx * k * radius)
    y.set(dy * k * radius)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <m.div
      className={cn('inline-block', className)}
      style={enabled ? { x: sx, y: sy } : undefined}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onBlur={reset}
    >
      {children}
    </m.div>
  )
}
