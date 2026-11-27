import { m } from 'framer-motion'
import { duration, ease, stagger } from '@/motion/tokens'
import { useMotionPreference } from '@/motion/useMotionPreference'

const W = 1200
const H = 800
const STEP = 100
const vertical = Array.from({ length: W / STEP - 1 }, (_, i) => (i + 1) * STEP)
const horizontal = Array.from({ length: H / STEP - 1 }, (_, i) => (i + 1) * STEP)

/**
 * Hairline background grid that draws itself in once (pathLength), then stays static.
 * Decorative only.
 */
export function HeroGrid({ className = '' }: { className?: string }) {
  const pref = useMotionPreference()
  const draw = (i: number) =>
    pref === 'reduced'
      ? { initial: false as const }
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { duration: duration.hero, ease: ease.outExpo, delay: i * stagger.words },
        }
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)] ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      stroke="var(--line)"
      strokeWidth="1"
      fill="none"
    >
      {vertical.map((x, i) => (
        <m.line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} {...draw(i)} />
      ))}
      {horizontal.map((y, i) => (
        <m.line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} {...draw(i + 3)} />
      ))}
    </svg>
  )
}
