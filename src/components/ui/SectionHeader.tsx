import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Reveal } from '@/motion/Reveal'
import { SplitText } from '@/motion/SplitText'
import { sequence } from '@/motion/tokens'

interface SectionHeaderProps {
  eyebrow?: string
  /** Section index shown before the eyebrow, as in "02 / Services". */
  index?: number
  title: string
  /** Number of trailing title words set in the softer second tone. */
  mutedWords?: number
  intro?: ReactNode
  id?: string
  className?: string
  as?: 'h1' | 'h2'
  align?: 'left' | 'center'
  /**
   * "stack" (default): label above the title.
   * "split": label in a narrow left column, title and intro on the right (12-col grid).
   */
  layout?: 'stack' | 'split'
}

/** Mono index label, e.g. "02 / Services". Decorative number, readable label. */
export function IndexLabel({
  index,
  children,
  className,
}: {
  index?: number
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('eyebrow inline-flex items-center gap-2', className)}>
      {index !== undefined ? (
        <>
          <span className="text-accent-ink tabular-nums">{String(index).padStart(2, '0')}</span>
          <span aria-hidden="true">/</span>
        </>
      ) : null}
      <span>{children}</span>
    </span>
  )
}

/** Index label + masked SplitText heading (uppercase display) + optional intro paragraph. */
export function SectionHeader({
  eyebrow,
  index,
  title,
  mutedWords,
  intro,
  id,
  className,
  as = 'h2',
  align = 'left',
  layout = 'stack',
}: SectionHeaderProps) {
  const label = eyebrow ? (
    <Reveal as="p" distance={12} className={layout === 'split' ? 'lg:pt-3' : 'mb-6'}>
      <IndexLabel index={index}>{eyebrow}</IndexLabel>
    </Reveal>
  ) : null

  const body = (
    <>
      <SplitText as={as} id={id} text={title} mutedWords={mutedWords} className="text-display" />
      {intro ? (
        <Reveal as="div" delay={sequence.follow} className="mt-6 max-w-2xl text-lead text-muted">
          {intro}
        </Reveal>
      ) : null}
    </>
  )

  if (layout === 'split') {
    return (
      <div className={cn('grid gap-6 lg:grid-cols-12 lg:gap-8', className)}>
        <div className="lg:col-span-3">{label}</div>
        <div className="lg:col-span-9">{body}</div>
      </div>
    )
  }

  return (
    <div className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {label}
      {body}
    </div>
  )
}
