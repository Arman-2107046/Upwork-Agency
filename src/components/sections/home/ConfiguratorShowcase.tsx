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
import { PINNED, useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/cn'
import { Reveal } from '@/motion/Reveal'
import { SplitText } from '@/motion/SplitText'
import { Stagger, StaggerItem } from '@/motion/Stagger'
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

function Intro({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <Reveal as="p" distance={12} className="mb-5">
        <IndexLabel index={3}>{showcase.eyebrow}</IndexLabel>
      </Reveal>
      <SplitText
        as="h2"
        id="showcase-title"
        text={showcase.title}
        className={compact ? 'text-[clamp(2rem,1rem+2.2vw,3rem)] leading-[0.98]' : 'text-display'}
      />
      <Reveal className={cn('max-w-md text-muted', compact ? 'mt-4 text-sm' : 'mt-6')}>
        <p>{showcase.intro}</p>
      </Reveal>
    </div>
  )
}

function StageMarker({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const n = stages.length
  const scaleX = useTransform(progress, [index / n, (index + 1) / n], [0, 1])
  return (
    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px overflow-hidden bg-line">
      <m.span className="block h-full origin-left bg-accent" style={{ scaleX }} />
    </span>
  )
}

/** Pinned (sticky) version: scroll advances the stages. Desktop + full motion only. */
function PinnedShowcase() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = Math.min(stages.length - 1, Math.max(0, Math.floor(p * stages.length)))
    if (next !== active) setActive(next)
  })

  const current = stages[active] ?? stages[0]

  return (
    <section
      ref={ref}
      aria-labelledby="showcase-title"
      className="relative isolate h-[250vh] border-t border-line"
    >
      <div className="sticky top-0 isolate flex h-screen items-center overflow-hidden">
        <div className="container-content relative grid grid-cols-12 items-center gap-12">
          <div className="col-span-5">
            <Intro compact />
            <ol className="mt-6 flex flex-col">
              {stages.map((stage, i) => (
                <li
                  key={stage.title}
                  className="relative py-3"
                  aria-current={i === active ? 'step' : undefined}
                >
                  <div className="flex items-baseline gap-4">
                    <span
                      className={cn(
                        'font-mono text-xs tabular-nums transition-colors duration-[var(--dur-base)]',
                        i === active ? 'text-accent-ink' : 'text-muted',
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
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
            <div className="mt-8">
              <ButtonLink to={ctaTo} variant="secondary" arrow>
                Explore the project
              </ButtonLink>
            </div>
          </div>
          <div className="col-span-7">
            <PreviewFrame label={current.title}>
              <AnimatePresence initial={false}>
                <m.div
                  key={current.title}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: duration.base, ease: ease.outExpo }}
                >
                  <StagePreview stage={current} />
                </m.div>
              </AnimatePresence>
            </PreviewFrame>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Stacked version for phones, tablets and reduced motion. */
function StackedShowcase() {
  return (
    <section
      aria-labelledby="showcase-title"
      className="relative isolate overflow-x-clip border-t border-line py-28"
    >
      <div className="container-content relative">
        <Intro />
        <Stagger as="ol" className="mt-12 grid gap-10 md:grid-cols-2">
          {stages.map((stage, i) => (
            <StaggerItem as="li" key={stage.title}>
              <PreviewFrame label={stage.title}>
                <div className="absolute inset-0">
                  <StagePreview stage={stage} />
                </div>
              </PreviewFrame>
              <div className="mt-5 flex items-baseline gap-4">
                <span className="font-mono text-xs text-accent-ink tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-lg tracking-[0.06em]">{stage.title}</h3>
                  <p className="mt-1 text-sm text-muted">{stage.text}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-12">
          <ButtonLink to={ctaTo} variant="secondary" arrow>
            Explore the project
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}

export function ConfiguratorShowcase() {
  const pref = useMotionPreference()
  const pinnable = useMediaQuery(PINNED)
  return pref === 'full' && pinnable ? <PinnedShowcase /> : <StackedShowcase />
}
