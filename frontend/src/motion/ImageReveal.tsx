import { m, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { duration, ease } from './tokens'
import { inViewOptions, reducedTransition } from './variants'
import { useMotionPreference } from './useMotionPreference'

export interface ImageRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  onMount?: boolean
}

/**
 * Clip-path reveal from the bottom while the inner content scales from 1.15 to 1.
 * The wrapper keeps its size the whole time, so nothing shifts.
 */
export function ImageReveal({ children, className, delay = 0, onMount = false }: ImageRevealProps) {
  const pref = useMotionPreference()
  const trigger = onMount
    ? { animate: 'show' }
    : { whileInView: 'show', viewport: inViewOptions(0.2) }

  const outer: Variants =
    pref === 'reduced'
      ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: reducedTransition } }
      : {
          hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
          show: {
            clipPath: 'inset(0% 0% 0% 0%)',
            transition: { duration: duration.hero, ease: ease.outExpo, delay },
          },
        }
  const inner: Variants =
    pref === 'reduced'
      ? {}
      : {
          hidden: { scale: 1.15 },
          show: { scale: 1, transition: { duration: duration.hero, ease: ease.outExpo, delay } },
        }

  return (
    <m.div
      className={cn('overflow-hidden', className)}
      variants={outer}
      initial="hidden"
      {...trigger}
    >
      <m.div className="h-full w-full origin-center" variants={inner}>
        {children}
      </m.div>
    </m.div>
  )
}
