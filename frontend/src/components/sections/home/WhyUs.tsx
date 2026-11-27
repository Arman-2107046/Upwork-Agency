import { m } from 'framer-motion'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { whyItems } from '@/data/why'
import { Stagger, StaggerItem } from '@/motion/Stagger'
import { duration, ease } from '@/motion/tokens'
import { useMotionPreference } from '@/motion/useMotionPreference'

function DrawnCheck() {
  const pref = useMotionPreference()
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 text-accent-ink"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="0.5"
        y="0.5"
        width="23"
        height="23"
        fill="none"
        stroke="var(--line-strong)"
        strokeWidth="1"
      />
      <m.path
        d="M7 12.5 L10.5 16 L17 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="square"
        strokeLinejoin="miter"
        variants={
          pref === 'reduced'
            ? undefined
            : {
                hidden: { pathLength: 0 },
                show: {
                  pathLength: 1,
                  transition: {
                    duration: duration.base,
                    ease: ease.outExpo,
                    delay: duration.micro,
                  },
                },
              }
        }
      />
    </svg>
  )
}

export function WhyUs() {
  return (
    <section aria-labelledby="why-title" className="relative border-t border-line py-28 sm:py-40">
      <div className="container-content relative">
        <SectionHeader
          layout="split"
          index={7}
          id="why-title"
          eyebrow="Why choose us"
          title="One partner, from design to deployment."
          mutedWords={3}
        />
        <div className="mt-16 grid lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <Stagger as="ol" className="flex flex-col lg:col-span-9 lg:col-start-4">
            {whyItems.map((item, i) => (
              <StaggerItem
                as="li"
                key={item}
                direction="right"
                className="grid grid-cols-[auto_1fr_auto] items-start gap-5 border-b border-line py-6 first:border-t sm:gap-8"
              >
                <span aria-hidden="true" className="pt-1 font-mono text-xs text-muted tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-lg leading-snug sm:text-xl">{item}</span>
                <span className="mt-0.5 shrink-0">
                  <DrawnCheck />
                </span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  )
}
