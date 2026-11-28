import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useRef, useState } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { Media } from '@/components/ui/Media'
import { IndexLabel } from '@/components/ui/SectionHeader'
import { showcase, type ShowcaseStage } from '@/data/showcase'
import { cn } from '@/lib/cn'
import { Reveal } from '@/motion/Reveal'
import { SplitText } from '@/motion/SplitText'
import { duration, ease } from '@/motion/tokens'
import { useMotionPreference } from '@/motion/useMotionPreference'
import { ShowcaseSketch } from './ShowcaseSketch'

const stages = showcase.stages
const ctaTo = `/work/${showcase.projectSlug}`

function StagePreview({ stage }: { stage: ShowcaseStage }) {
  return stage.image.src ? (
    <Media image={stage.image} sizes="(min-width: 1024px) 55vw, (min-width: 768px) 50vw, 100vw" />
  ) : (
    <div role="img" aria-label={`${stage.image.alt} (schematic preview)`} className="h-full w-full">
      <ShowcaseSketch kind={stage.sketch} />
    </div>
  )
}

function PreviewFrame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="overflow-hidden border border-line bg-surface shadow-elev">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="size-2 bg-line-strong" />
        <span className="size-2 bg-line-strong" />
        <span className="size-2 bg-accent" />
        <span className="ml-3 truncate font-mono text-label tracking-[0.2em] text-muted uppercase">
          {label}
        </span>
      </div>
      <div className="relative aspect-[4/3]">{children}</div>
    </div>
  )
}

function Intro() {
  return (
    <div>
      <Reveal as="p" distance={12} className="mb-4 lg:mb-5">
        <IndexLabel index={3}>{showcase.eyebrow}</IndexLabel>
      </Reveal>
      <SplitText
        as="h2"
        id="showcase-title"
        text={showcase.title}
        className="text-[clamp(1.75rem,1rem+2.2vw,3rem)] leading-[0.98]"
      />
      <Reveal className="mt-4 hidden max-w-md text-sm text-muted md:block [@media(max-height:620px)]:hidden">
        <p>{showcase.intro}</p>
      </Reveal>
    </div>
  )
}

/** Scroll progress for one stage, 0 → 1 while that stage is active. */
function useStageProgress(progress: MotionValue<number>, index: number) {
  const n = stages.length
  return useTransform(progress, [index / n, (index + 1) / n], [0, 1])
}

function StageMarker({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const scaleX = useStageProgress(progress, index)
  return (
    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px overflow-hidden bg-line">
      <m.span className="block h-full origin-left bg-accent" style={{ scaleX }} />
    </span>
  )
}

function StageSegment({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const scaleX = useStageProgress(progress, index)
  return (
    <span className="h-0.5 flex-1 overflow-hidden bg-line">
      <m.span className="block h-full origin-left bg-accent" style={{ scaleX }} />
    </span>
  )
}

/**
 * Pinned (sticky) showcase on every screen size: scrolling through the section advances the
 * stages and swaps the single preview. Desktop shows the full stage list beside the preview;
 * smaller screens show the preview with a segmented progress bar and the active stage below.
 * Under reduced motion it stays scroll-driven but the preview swap is a short fade.
 */
export function ConfiguratorShowcase() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useMotionPreference() === 'reduced'
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = Math.min(stages.length - 1, Math.max(0, Math.floor(p * stages.length)))
    if (next !== active) setActive(next)
  })

  const current = stages[active] ?? stages[0]
  const number = (i: number) => String(i + 1).padStart(2, '0')

  return (
    <section
      ref={ref}
      aria-labelledby="showcase-title"
      className="relative isolate h-[300vh] border-t border-line lg:h-[250vh]"
    >
      <div className="sticky top-0 isolate flex h-[100svh] items-center overflow-hidden pt-header lg:pt-0">
        <div className="container-content relative grid gap-5 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-5">
            <Intro />
            <ol className="mt-6 hidden flex-col lg:flex [@media(max-height:720px)]:mt-3">
              {stages.map((stage, i) => (
                <li
                  key={stage.title}
                  className="relative py-3 [@media(max-height:720px)]:py-2"
                  aria-current={i === active ? 'step' : undefined}
                >
                  <div className="flex items-baseline gap-4">
                    <span
                      className={cn(
                        'font-mono text-xs tabular-nums transition-colors duration-[var(--dur-base)]',
                        i === active ? 'text-accent-ink' : 'text-muted',
                      )}
                    >
                      {number(i)}
                    </span>
                    <div>
                      <h3
                        className={cn(
                          'text-lg tracking-[0.06em] transition-opacity duration-[var(--dur-base)]',
                          i === active ? 'opacity-100' : 'opacity-60',
                        )}
                      >
                        {stage.title}
                      </h3>
                      <p
                        className={cn(
                          'text-sm text-muted transition-opacity duration-[var(--dur-base)]',
                          i === active ? 'opacity-100' : 'opacity-0',
                        )}
                      >
                        {stage.text}
                      </p>
                    </div>
                  </div>
                  <StageMarker progress={scrollYProgress} index={i} />
                </li>
              ))}
            </ol>
            <div className="mt-8 hidden lg:block [@media(max-height:720px)]:mt-4">
              <ButtonLink to={ctaTo} variant="secondary" arrow>
                Explore the project
              </ButtonLink>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="mx-auto w-full max-w-[calc((100svh-21rem)*4/3)] lg:max-w-[calc((100svh-7rem)*4/3)]">
              <PreviewFrame label={current.title}>
                <AnimatePresence initial={false}>
                  <m.div
                    key={current.title}
                    className="absolute inset-0"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.03 }}
                    animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={
                      reduced
                        ? { duration: duration.reducedFade }
                        : { duration: duration.base, ease: ease.outExpo }
                    }
                  >
                    <StagePreview stage={current} />
                  </m.div>
                </AnimatePresence>
              </PreviewFrame>
            </div>
          </div>

          {/* Below lg: segmented progress, the active stage, and the CTA. */}
          <div className="lg:hidden">
            <div aria-hidden="true" className="flex gap-1.5">
              {stages.map((stage, i) => (
                <StageSegment key={stage.title} progress={scrollYProgress} index={i} />
              ))}
            </div>
            <div className="mt-4 flex min-h-[4.5rem] items-baseline gap-4" aria-live="polite">
              <span className="font-mono text-xs text-accent-ink tabular-nums">
                {number(active)}
                <span className="text-muted"> / {number(stages.length - 1)}</span>
              </span>
              <div>
                <h3 className="text-lg tracking-[0.06em]">{current.title}</h3>
                <p className="mt-1 text-sm text-muted">{current.text}</p>
              </div>
            </div>
            <div className="mt-4">
              <ButtonLink to={ctaTo} variant="secondary" arrow>
                Explore the project
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
