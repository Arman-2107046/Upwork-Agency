import { m, useInView, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '@/lib/cn'
import { scrollFill } from './tokens'
import { useMotionPreference } from './useMotionPreference'

function Word({
  word,
  progress,
  range,
  keepCase,
}: {
  word: string
  progress: MotionValue<number>
  range: [number, number]
  keepCase: boolean
}) {
  const opacity = useTransform(progress, range, [scrollFill.minOpacity, 1])
  return (
    <m.span style={{ opacity }} className={keepCase ? 'normal-case' : undefined}>
      {word}
    </m.span>
  )
}

export interface TextScrollFillProps {
  text: string
  className?: string
  /** Words that keep their casing when the block is set in uppercase (brand names). */
  keepCase?: string[]
}

/**
 * Statement text whose words go from tokens.scrollFill.minOpacity to 100% opacity as it scrolls through the
 * viewport. The effect arms only once the block is within a viewport of the screen, so it
 * does no work off-screen and starts fully readable. Full opacity under reduced motion.
 */
export function TextScrollFill({ text, className, keepCase = [] }: TextScrollFillProps) {
  const pref = useMotionPreference()
  const ref = useRef<HTMLParagraphElement>(null)
  const armed = useInView(ref, { once: true, margin: '0px 0px 50% 0px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] })

  const words = text.split(/\s+/)
  const active = pref === 'full' && armed

  return (
    <p ref={ref} className={cn(className)}>
      {active
        ? words.map((word, i) => (
            <span key={`${word}-${i}`}>
              <Word
                word={word}
                progress={scrollYProgress}
                range={[i / words.length, (i + 1) / words.length]}
                keepCase={keepCase.includes(word)}
              />
              {i < words.length - 1 ? ' ' : null}
            </span>
          ))
        : words.map((word, i) => (
            <span key={`${word}-${i}`}>
              <span className={keepCase.includes(word) ? 'normal-case' : undefined}>{word}</span>
              {i < words.length - 1 ? ' ' : null}
            </span>
          ))}
    </p>
  )
}
