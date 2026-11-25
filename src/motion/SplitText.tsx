import { m, type Variants } from 'framer-motion'
import { Fragment, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { duration as durations, ease, stagger as staggers } from './tokens'
import { inViewOptions, reducedTransition } from './variants'
import { useMotionPreference } from './useMotionPreference'

const tags = { h1: m.h1, h2: m.h2, h3: m.h3, p: m.p, span: m.span }

export interface SplitTextProps {
  text: string
  as?: keyof typeof tags
  /** "word" (default) or "line" (lines separated by "\n" in text). */
  by?: 'word' | 'line'
  className?: string
  delay?: number
  duration?: number
  stagger?: number
  /** Animate on mount (hero) instead of when scrolled into view. */
  onMount?: boolean
  id?: string
  tabIndex?: number
  /** Render the last N words in the softer second tone (fg-soft). Word mode only. */
  mutedWords?: number
  /** Decorative node placed after the last word (a caret, for example). Hidden from AT. */
  trailing?: ReactNode
}

/**
 * Splits text into masked words or lines that slide up from 110%.
 * Screen readers get the full text once through aria-label; the pieces are aria-hidden.
 */
export function SplitText({
  text,
  as = 'h2',
  by = 'word',
  className,
  delay = 0,
  duration = durations.reveal,
  stagger = staggers.words,
  onMount = false,
  id,
  tabIndex,
  mutedWords = 0,
  trailing,
}: SplitTextProps) {
  const pref = useMotionPreference()
  const Tag = tags[as] as typeof m.h2
  const label = text.replace(/\n/g, ' ')
  const trigger = onMount
    ? { animate: 'show' }
    : { whileInView: 'show', viewport: inViewOptions('some') }

  const words = label.split(/\s+/)
  const mutedFrom = by === 'word' && mutedWords > 0 ? words.length - mutedWords : Infinity
  const tail = trailing ? (
    <span aria-hidden="true" className="inline">
      {trailing}
    </span>
  ) : null

  if (pref === 'reduced') {
    const head = Number.isFinite(mutedFrom) ? words.slice(0, mutedFrom).join(' ') : label
    const soft = Number.isFinite(mutedFrom) ? words.slice(mutedFrom).join(' ') : ''
    return (
      <Tag
        id={id}
        tabIndex={tabIndex}
        className={className}
        initial={{ opacity: 0 }}
        variants={{ show: { opacity: 1, transition: reducedTransition } }}
        {...trigger}
      >
        {soft ? (
          <>
            {head} <span className="text-fg-soft">{soft}</span>
          </>
        ) : (
          head
        )}
        {tail}
      </Tag>
    )
  }

  const pieces = by === 'line' ? text.split('\n') : words
  const parent: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  }
  const child: Variants = {
    hidden: { y: '110%' },
    show: { y: '0%', transition: { duration, ease: ease.outExpo } },
  }

  return (
    <Tag
      id={id}
      tabIndex={tabIndex}
      className={className}
      aria-label={label}
      variants={parent}
      initial="hidden"
      {...trigger}
    >
      {pieces.map((piece, i) => (
        <Fragment key={`${piece}-${i}`}>
          <span
            aria-hidden="true"
            className={cn(
              '-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top',
              by === 'line' && 'block',
              i >= mutedFrom && 'text-fg-soft',
            )}
          >
            <m.span className="inline-block will-change-transform" variants={child}>
              {piece}
            </m.span>
          </span>
          {by === 'word' && i < pieces.length - 1 ? ' ' : null}
        </Fragment>
      ))}
      {tail}
    </Tag>
  )
}
