import { animate, m, useInView, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { duration, ease } from './tokens'
import { useMotionPreference } from './useMotionPreference'

export interface CountUpProps {
  /** Only factual numbers (for example the count of services). Never invented metrics. */
  value: number
  className?: string
  /** Zero-pad to this many digits ("08"). */
  pad?: number
}

/** Counts from 0 to value once in view. Width is reserved with tabular numerals. */
export function CountUp({ value, className, pad = 0 }: CountUpProps) {
  const pref = useMotionPreference()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const mv = useMotionValue(pref === 'reduced' ? value : 0)
  const text = useTransform(mv, (v) => String(Math.round(v)).padStart(pad, '0'))

  useEffect(() => {
    if (!inView) return
    if (pref === 'reduced') {
      mv.set(value)
      return
    }
    const controls = animate(mv, value, { duration: duration.countUp, ease: ease.outExpo })
    return () => controls.stop()
  }, [inView, pref, value, mv])

  const final = String(value).padStart(pad, '0')
  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{final}</span>
      <m.span
        aria-hidden="true"
        className="inline-block tabular-nums"
        style={{ minWidth: `${final.length}ch` }}
      >
        {text}
      </m.span>
    </span>
  )
}
