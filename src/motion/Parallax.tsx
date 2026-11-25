import { m, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { parallaxRange, spring } from './tokens'
import { useMotionPreference } from './useMotionPreference'

export interface ParallaxProps {
  children: ReactNode
  /** -0.3 to 0.3. Positive moves slower than the page (drifts down), negative moves faster. */
  speed?: number
  className?: string
}

/** Scroll-linked translateY, smoothed with a spring. Static under reduced motion. */
export function Parallax({ children, speed = 0.1, className }: ParallaxProps) {
  const pref = useMotionPreference()
  const ref = useRef<HTMLDivElement>(null)
  const clamped = Math.max(-0.3, Math.min(0.3, speed))
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const travel = clamped * parallaxRange
  const raw = useTransform(scrollYProgress, [0, 1], [-travel / 2, travel / 2])
  const y = useSpring(raw, spring.scroll)

  return (
    <m.div ref={ref} className={className} style={pref === 'full' ? { y } : undefined}>
      {children}
    </m.div>
  )
}
