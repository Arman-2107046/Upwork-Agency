import {
  m,
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useRef } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { processSteps } from '@/data/process'
import { cn } from '@/lib/cn'
import { CountUp } from '@/motion/CountUp'
import { Reveal } from '@/motion/Reveal'
import { spring } from '@/motion/tokens'
import { useMotionPreference } from '@/motion/useMotionPreference'

const n = processSteps.length

type StepProps = { progress: MotionValue<number>; index: number; reduced: boolean }

const pad = (v: number) => String(v).padStart(2, '0')

/** Where a step sits on the 0–1 scroll progress of the list. */
const stepAt = (index: number) => index / (n - 1)

function Marker({ progress, index, reduced }: StepProps) {
  const at = stepAt(index)
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

/** Hairline that draws from the timeline toward the step once the line reaches it. */
function Connector({ progress, index, reduced, left }: StepProps & { left: boolean }) {
  const at = stepAt(index)
  const scaleX = useTransform(progress, [Math.max(0, at - 0.02), at + 0.02], [0, 1])
  return (
    <m.span
      aria-hidden="true"
      className={cn(
        'absolute top-[13px] hidden h-px w-10 bg-accent md:block',
        left ? 'right-[calc(50%+0.75rem)] origin-right' : 'left-[calc(50%+0.75rem)] origin-left',
      )}
      style={reduced ? undefined : { scaleX }}
    />
  )
}

/**
 * Oversized outlined step number on the far side of the line. Its accent outline fills
 * bottom-up as the timeline approaches the step.
 */
function Numeral({ progress, index, reduced, left }: StepProps & { left: boolean }) {
  const at = stepAt(index)
  const inset = useTransform(progress, [Math.max(0, at - 0.14), at], [100, 0])
  const clipPath = useMotionTemplate`inset(${inset}% 0 0 0)`
  const label = pad(index + 1)
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative hidden self-start font-display text-[clamp(5rem,2.5rem+6vw,8.5rem)] leading-[0.78] font-bold tabular-nums select-none md:block',
        left
          ? 'col-start-2 row-start-1 justify-self-start pl-16'
          : 'col-start-1 row-start-1 justify-self-end pr-16',
      )}
    >
      <span className="text-transparent [-webkit-text-stroke:1px_var(--line-strong)]">{label}</span>
      <m.span
        className={cn(
          'absolute inset-y-0 text-[color-mix(in_srgb,var(--accent)_10%,transparent)] [-webkit-text-stroke:1px_var(--accent)]',
          left ? 'left-16' : 'left-0',
        )}
        style={reduced ? undefined : { clipPath }}
      >
        {label}
      </m.span>
    </div>
  )
}

/** Step copy: dimmed until the timeline reaches it. */
function StepBody({
  progress,
  index,
  reduced,
  left,
  children,
}: StepProps & { left: boolean; children: React.ReactNode }) {
  const at = stepAt(index)
  const opacity = useTransform(progress, [Math.max(0, at - 0.1), at], [0.35, 1])
  return (
    <m.div
      className={cn(
        'row-start-1 max-w-md',
        left
          ? 'md:col-start-1 md:justify-self-end md:pr-16 md:text-right'
          : 'md:col-start-2 md:pl-16',
      )}
      style={reduced ? undefined : { opacity }}
    >
      {children}
    </m.div>
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

        <ol ref={listRef} className="relative mt-16 flex flex-col gap-14 md:mt-20 md:gap-24">
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
                <Connector progress={progress} index={i} reduced={reduced} left={left} />
                <Numeral progress={progress} index={i} reduced={reduced} left={left} />
                <StepBody progress={progress} index={i} reduced={reduced} left={left}>
                  <Reveal direction={left ? 'right' : 'left'}>
                    <p className="font-mono text-xs text-accent-ink tabular-nums">
                      {pad(i + 1)} / {pad(n)}
                    </p>
                    <h3 className="mt-3 text-title">{step.title}</h3>
                    <p className="mt-3 text-muted">{step.text}</p>
                  </Reveal>
                </StepBody>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
