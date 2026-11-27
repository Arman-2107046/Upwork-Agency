import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { servicePath, services } from '@/data/services'
import { CountUp } from '@/motion/CountUp'
import { SpotlightCard } from '@/motion/SpotlightCard'
import { Stagger, StaggerItem } from '@/motion/Stagger'
import { preloadRoute } from '@/routes/preload'

export function ServicesGrid() {
  return (
    <section
      aria-labelledby="services-title"
      className="relative border-t border-line py-28 sm:py-40"
    >
      <div className="container-content relative">
        <SectionHeader
          layout="split"
          index={2}
          id="services-title"
          eyebrow="Services"
          title="Everything your product needs, under one roof."
          mutedWords={3}
          intro="From the first design file to the server it runs on."
        />

        <div className="mt-16 flex items-end justify-between gap-6 border-b border-line pb-4 lg:mt-20">
          <p className="eyebrow">What we deliver</p>
          <p className="flex items-baseline gap-3">
            <CountUp
              value={services.length}
              pad={2}
              className="font-display text-3xl font-bold tabular-nums"
            />
            <span className="eyebrow">Core services</span>
          </p>
        </div>

        <Stagger
          as="ul"
          className="grid grid-cols-1 border-l border-line sm:grid-cols-2 lg:grid-cols-4"
        >
          {services.map((s, i) => (
            <StaggerItem as="li" key={s.slug} direction="up" className="h-full">
              <SpotlightCard
                as="article"
                tilt={false}
                variant="cell"
                className="flex h-full flex-col border-r border-b border-line p-6 sm:min-h-[22rem] sm:p-7"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/spot:scale-x-100"
                />
                <div className="flex items-start justify-between">
                  <span aria-hidden="true" className="font-mono text-xs text-muted tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="grid size-10 place-items-center border border-line text-accent-ink transition-colors duration-[var(--dur-micro)] group-hover/spot:border-fg">
                    <ServiceIcon name={s.icon} size={18} />
                  </span>
                </div>
                <h3 className="mt-8 text-base leading-snug tracking-[0.08em] sm:mt-16">
                  {s.title}
                </h3>
                <p className="mt-3 mb-6 text-sm text-muted">{s.summary}</p>
                <Link
                  to={servicePath(s.slug)}
                  onPointerEnter={() => preloadRoute(servicePath(s.slug))}
                  onFocus={() => preloadRoute(servicePath(s.slug))}
                  className="group/more mt-auto inline-flex min-h-11 items-center gap-2 self-start font-mono text-label tracking-[0.2em] uppercase"
                >
                  <span className="link-underline">Learn more</span>
                  <span className="sr-only"> about {s.title}</span>
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/spot:translate-x-1 group-focus-visible/more:translate-x-1"
                  />
                </Link>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
