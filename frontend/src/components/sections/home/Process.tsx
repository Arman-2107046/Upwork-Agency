import { m, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { processSteps } from '@/data/process'
import { cn } from '@/lib/cn'
import { CountUp } from '@/motion/CountUp'
import { Reveal } from '@/motion/Reveal'
import { spring } from '@/motion/tokens'
import { useMotionPreference } from '@/motion/useMotionPreference'

const n = processSteps.length

function Marker({
  progress,
  index,
  reduced,
}: {
  progress: MotionValue<number>
  index: number
  reduced: boolean
}) {
  const at = index / (n - 1)
  const fill = useTransform(progress, [Math.max(0, at - 0.04), at], [0, 1])
  return (
    <span
      aria-hidden="true"
      className="absolute top-1.5 left-4 grid size-4 -translate-x-1/2 place-items-center border border-line-strong bg-bg md:left-1/2"
    >
      <m.span
        className="size-2 bg-accent"
        style={reduced ? undefined : { opacity: fill, scale: fill }}
      />
    </span>
  )
}

export function Process() {
  const pref = useMotionPreference()
  const reduced = pref === 'reduced'
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.65', 'end 0.65'] })
  const progress = useSpring(scrollYProgress, spring.scroll)

  return (
    <section
      aria-labelledby="process-title"
      className="relative border-t border-line py-28 sm:py-40"
    >
      <div className="container-content relative">
        <SectionHeader
          layout="split"
          index={4}
          id="process-title"
          eyebrow="Process"
          title="A clear path from idea to launch."
          mutedWords={3}
        />
        <div className="mt-16 flex items-end justify-between gap-6 border-b border-line pb-4 lg:mt-20">
          <p className="eyebrow">How a project runs</p>
          <p className="flex items-baseline gap-3">
            <CountUp value={n} pad={2} className="font-display text-3xl font-bold tabular-nums" />
            <span className="eyebrow">Steps, start to finish</span>
          </p>
        </div>

        <ol ref={listRef} className="relative mt-16 flex flex-col gap-14 md:gap-20">
          {/* Uniform stroke without vector-effect so pathLength dashes map 1:1 to the line */}
          <svg
            aria-hidden="true"
            focusable="false"
            className="absolute top-2 left-4 h-[calc(100%-1rem)] w-0.5 -translate-x-1/2 overflow-visible md:left-1/2"
            preserveAspectRatio="none"
            viewBox="0 0 2 100"
          >
            <line x1="1" y1="0" x2="1" y2="100" stroke="var(--line-strong)" strokeWidth="1" />
            <m.line
              x1="1"
              y1="0"
              x2="1"
              y2="100"
              stroke="var(--accent)"
              strokeWidth="2"
              style={reduced ? undefined : { pathLength: progress }}
            />
          </svg>

          {processSteps.map((step, i) => {
            const left = i % 2 === 0
            return (
              <li key={step.title} className="relative grid pl-12 md:grid-cols-2 md:pl-0">
                <Marker progress={progress} index={i} reduced={reduced} />
                <Reveal
                  direction={left ? 'right' : 'left'}
                  className={cn(
                    'max-w-md',
                    left
                      ? 'md:col-start-1 md:justify-self-end md:pr-16 md:text-right'
                      : 'md:col-start-2 md:pl-16',
                  )}
                >
                  <p className="font-mono text-xs text-accent-ink tabular-nums">
                    {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                  </p>
                  <h3 className="mt-3 text-title">{step.title}</h3>
                  <p className="mt-3 text-muted">{step.text}</p>
                </Reveal>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
