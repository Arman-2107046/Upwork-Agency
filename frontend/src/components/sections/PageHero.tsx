import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { site } from '@/config/site'
import { cn } from '@/lib/cn'
import { Reveal } from '@/motion/Reveal'
import { SplitText } from '@/motion/SplitText'
import { sequence } from '@/motion/tokens'
import { HeroGrid } from './HeroGrid'

interface PageHeroProps {
  eyebrow: string
  title: string
  intro?: ReactNode
  /** Number of trailing title words set in the softer second tone. */
  mutedWords?: number
  children?: ReactNode
  className?: string
}

/** Intro band used at the top of every inner page (holds the page's single h1). */
export function PageHero({
  eyebrow,
  title,
  intro,
  mutedWords,
  children,
  className,
}: PageHeroProps) {
  const { pathname } = useLocation()
  return (
    <section className={cn('relative overflow-hidden border-b border-line', className)}>
      <HeroGrid />
      <div className="container-content relative pt-[calc(var(--spacing-header)+72px)] pb-20 sm:pt-[calc(var(--spacing-header)+112px)] sm:pb-28">
        <Reveal as="p" onMount className="mb-6 font-mono text-xs text-muted" distance={12}>
          <span className="text-accent-ink">{site.handle}</span>:~$ cd {pathname}
        </Reveal>
        <Reveal as="p" onMount className="eyebrow mb-6" distance={12} delay={0.05}>
          {eyebrow}
        </Reveal>
        <SplitText
          as="h1"
          onMount
          text={title}
          mutedWords={mutedWords}
          trailing={<span className="caret" />}
          className="max-w-5xl text-hero"
        />
        {intro ? (
          <Reveal
            onMount
            delay={sequence.pageIntro}
            className="mt-8 max-w-2xl text-lead text-muted"
          >
            {intro}
          </Reveal>
        ) : null}
        {children}
      </div>
    </section>
  )
}
