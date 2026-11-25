import { Pause, Play } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useMotionPreference } from './useMotionPreference'

export interface MarqueeProps {
  items: string[]
  /** Accessible name of the list. */
  label: string
  className?: string
}

/**
 * Infinite horizontal ticker. Uses a CSS transform keyframe (compositor only) whose
 * duration comes from tokens via --dur-marquee. Pauses on hover, on focus and via the
 * pause button. Static, wrapped row under reduced motion.
 */
export function Marquee({ items, label, className }: MarqueeProps) {
  const pref = useMotionPreference()
  const [paused, setPaused] = useState(false)

  const itemClass =
    'flex items-center gap-8 pr-8 font-display text-xl font-bold tracking-[0.06em] text-fg/80 uppercase whitespace-nowrap sm:text-2xl'
  const dot = <span aria-hidden="true" className="size-1.5 bg-accent" />

  if (pref === 'reduced') {
    return (
      <div className={cn('container-content', className)}>
        <ul aria-label={label} className="flex flex-wrap gap-x-6 gap-y-3">
          {items.map((item) => (
            <li key={item} className={itemClass}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className={cn('marquee relative flex items-center', className)} data-paused={paused}>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="marquee-track flex w-max">
          <ul aria-label={label} className="flex shrink-0">
            {items.map((item) => (
              <li key={item} className={itemClass}>
                {item}
                {dot}
              </li>
            ))}
          </ul>
          <ul aria-hidden="true" className="flex shrink-0">
            {items.map((item) => (
              <li key={item} className={itemClass}>
                {item}
                {dot}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? 'Play technology ticker' : 'Pause technology ticker'}
        className="icon-btn mr-3 ml-2 sm:mr-6"
      >
        {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      </button>
    </div>
  )
}
