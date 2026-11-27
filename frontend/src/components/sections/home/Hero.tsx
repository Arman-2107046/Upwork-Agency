import { AnimatePresence, m, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { site } from '@/config/site'
import { hero } from '@/data/home'
import { services } from '@/data/services'
import { heroTech } from '@/data/technologies'
import { DESKTOP, useMediaQuery } from '@/hooks/useMediaQuery'
import { Magnetic } from '@/motion/Magnetic'
import { Reveal } from '@/motion/Reveal'
import { SplitText } from '@/motion/SplitText'
import { Stagger, StaggerItem } from '@/motion/Stagger'
import { duration, ease, parallaxRange, sequence } from '@/motion/tokens'
import { useMotionPreference } from '@/motion/useMotionPreference'
import { HeroGlobe } from './HeroGlobe'

/** Facts in the strip under the hero. Each comes from config or data, never hard-coded. */
function heroFacts(): { label: string; value: string }[] {
  const facts: { label: string; value: string }[] = []
  if (site.claims.yearsExperience) {
    facts.push({ label: 'Experience', value: `${site.claims.yearsExperience} years` })
  }
  facts.push({
    label: 'Services',
    value: `${String(services.length).padStart(2, '0')} disciplines`,
  })
  facts.push({ label: 'Delivery', value: 'Design to deployment' })
  facts.push({ label: 'Response', value: site.responseTime })
  if (facts.length < 4)
    facts.splice(1, 0, { label: 'Stack', value: heroTech.slice(0, 3).join(' · ') })
  return facts.slice(0, 4)
}

/** Mount the globe after first paint so it never competes with the LCP heading. */
function useAfterPaint(): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    }
    const id = globalThis.setTimeout(() => setReady(true), 600)
    return () => globalThis.clearTimeout(id)
  }, [])
  return ready
}

export function Hero() {
  const pref = useMotionPreference()
  const desktop = useMediaQuery(DESKTOP)
  const painted = useAfterPaint()
  const ref = useRef<HTMLElement>(null)
  const { scrollY } = useScroll()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const globeY = useTransform(scrollYProgress, [0, 1], [0, parallaxRange * 0.35])
  const [showCue, setShowCue] = useState(true)
  const facts = heroFacts()

  useMotionValueEvent(scrollY, 'change', (y) => {
    if (y > 24 && showCue) setShowCue(false)
  })

  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col overflow-hidden">
      {desktop && painted ? (
        <m.div
          className="pointer-events-none absolute top-1/2 right-[max(-4rem,calc((100vw-1200px)/2-6rem))] w-[min(34rem,40vw)] -translate-y-[54%]"
          style={pref === 'full' ? { y: globeY } : undefined}
          initial={pref === 'full' ? { opacity: 0, scale: 0.96 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: duration.hero, ease: ease.outExpo }}
        >
          <HeroGlobe />
        </m.div>
      ) : null}

      <div className="container-content relative flex flex-1 flex-col justify-center pt-[calc(var(--spacing-header)+56px)] pb-16">
        <div className="max-w-[52rem]">
          <Reveal as="p" onMount distance={12} className="mb-5 font-mono text-xs text-muted">
            <span className="text-accent-ink">{site.handle}</span>:~$ ./build --end-to-end
          </Reveal>
          <Reveal as="p" onMount distance={12} delay={0.05} className="eyebrow mb-6">
            {hero.eyebrow}
          </Reveal>
          <SplitText
            as="h1"
            onMount
            text={hero.headline}
            mutedWords={4}
            trailing={<span className="caret" />}
            duration={duration.hero}
            className="text-hero"
          />
          <Reveal onMount delay={sequence.heroSub} className="mt-8 max-w-xl text-lead text-muted">
            <p>{hero.sub}</p>
          </Reveal>

          <Stagger
            onMount
            delay={sequence.heroCtas}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <StaggerItem>
              <Magnetic>
                <ButtonLink to="/contact" arrow>
                  Start a project
                </ButtonLink>
              </Magnetic>
            </StaggerItem>
            <StaggerItem>
              <ButtonLink to="/work" variant="secondary">
                View our work
              </ButtonLink>
            </StaggerItem>
          </Stagger>
        </div>
      </div>

      <div className="container-content relative">
        <Stagger
          as="dl"
          onMount
          delay={sequence.heroChips}
          className="grid grid-cols-2 border-t border-line lg:grid-cols-4"
        >
          {facts.map((f, i) => (
            <StaggerItem
              key={f.label}
              className={`py-6 pr-4 ${i % 2 === 1 ? 'pl-4 lg:pl-6' : ''} ${i > 1 ? 'border-t border-line lg:border-t-0' : ''} ${i > 0 ? 'lg:border-l lg:border-line lg:pl-6' : ''}`}
            >
              <dt className="eyebrow">{f.label}</dt>
              <dd className="mt-2 font-display text-sm font-bold tracking-[0.08em] uppercase sm:text-base">
                {f.value}
              </dd>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <AnimatePresence>
        {showCue ? (
          <m.div
            aria-hidden="true"
            className="absolute right-5 bottom-28 hidden flex-col items-center gap-3 font-mono text-label tracking-[0.22em] text-muted uppercase [writing-mode:vertical-rl] sm:right-8 md:flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: sequence.heroCue } }}
            exit={{ opacity: 0, transition: { duration: duration.micro } }}
          >
            Scroll
            <span className="relative block h-10 w-px overflow-hidden bg-line">
              <span className="scroll-cue-line absolute inset-0 bg-accent" />
            </span>
          </m.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
