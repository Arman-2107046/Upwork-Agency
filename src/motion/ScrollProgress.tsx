import { m, useScroll, useSpring } from 'framer-motion'
import { cn } from '@/lib/cn'
import { spring } from './tokens'
import { useMotionPreference } from './useMotionPreference'

/** 2px accent bar whose scaleX follows page scroll progress. */
export function ScrollProgress({ className }: { className?: string }) {
  const pref = useMotionPreference()
  const { scrollYProgress } = useScroll()
  const smooth = useSpring(scrollYProgress, spring.scroll)
  return (
    <m.div
      aria-hidden="true"
      className={cn('h-0.5 origin-left bg-accent', className)}
      style={{ scaleX: pref === 'full' ? smooth : scrollYProgress }}
    />
  )
}
