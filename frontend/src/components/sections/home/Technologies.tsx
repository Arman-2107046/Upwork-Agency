import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { TechLogo } from '@/components/ui/TechLogo'
import { technologyGroups } from '@/data/technologies'
import { Stagger, StaggerItem } from '@/motion/Stagger'
import { preloadRoute } from '@/routes/preload'

const cell = 'border-r border-b border-line p-6 sm:p-7'

export function Technologies() {
  // An even number of cells keeps the shared-border table closed on every breakpoint.
  const needsFiller = technologyGroups.length % 2 === 1
  return (
    <section aria-labelledby="tech-title" className="relative border-t border-line py-28 sm:py-40">
      <div className="container-content relative">
        <SectionHeader
          layout="split"
          index={5}
          id="tech-title"
          eyebrow="Technologies"
          title="A modern, proven stack."
          mutedWords={2}
        />
        <Stagger className="mt-16 grid grid-cols-1 border-t border-l border-line sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {technologyGroups.map((group) => (
            <StaggerItem key={group.label} className={cell}>
              <h3 className="flex items-center justify-between font-mono text-label font-normal tracking-[0.22em] text-muted">
                {group.label}
                <span aria-hidden="true" className="tabular-nums">
                  {String(group.items.length).padStart(2, '0')}
                </span>
              </h3>
              <ul className="mt-6 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="inline-flex items-center gap-2 border border-line px-3 py-2 text-sm transition-colors duration-[var(--dur-micro)] hover:border-fg"
                  >
                    <TechLogo name={item} size={15} />
                    {item}
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
          {needsFiller ? (
            <StaggerItem className={`${cell} flex flex-col justify-between gap-6 bg-surface`}>
              <p className="font-mono text-label tracking-[0.22em] text-muted uppercase">
                Not listed?
              </p>
              <Link
                to="/contact"
                onPointerEnter={() => preloadRoute('/contact')}
                onFocus={() => preloadRoute('/contact')}
                className="group/ask inline-flex min-h-11 items-center gap-2 self-start font-display text-lg font-bold tracking-[0.06em] uppercase"
              >
                <span className="link-underline">Ask about your stack</span>
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/ask:translate-x-1"
                />
              </Link>
            </StaggerItem>
          ) : null}
        </Stagger>
      </div>
    </section>
  )
}
