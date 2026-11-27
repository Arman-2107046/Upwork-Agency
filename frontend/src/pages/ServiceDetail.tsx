import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { serviceJsonLd } from '@/components/seo/jsonLd'
import { PageHero } from '@/components/sections/PageHero'
import { ProjectCard } from '@/components/sections/ProjectCard'
import { ButtonLink } from '@/components/ui/Button'
import { Media } from '@/components/ui/Media'
import { IndexLabel, SectionHeader } from '@/components/ui/SectionHeader'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { TechLogo } from '@/components/ui/TechLogo'
import { processSteps } from '@/data/process'
import { getProject, projects } from '@/data/projects'
import { getService, servicePath, services, type Service } from '@/data/services'
import { technologyGroups } from '@/data/technologies'
import { Reveal } from '@/motion/Reveal'
import { Stagger, StaggerItem } from '@/motion/Stagger'
import { sequence } from '@/motion/tokens'
import { preloadRoute } from '@/routes/preload'
import NotFound from './NotFound'

const pad = (n: number) => String(n).padStart(2, '0')

function Visual({ service }: { service: Service }) {
  const project = service.example ? getProject(service.example.projectSlug) : undefined
  if (service.example && project) {
    return (
      <figure>
        <div className="overflow-hidden border border-line bg-surface shadow-elev">
          <Media image={service.example.image} sizes="(min-width: 1024px) 45vw, 100vw" />
        </div>
        <figcaption className="eyebrow mt-3">From {project.title}</figcaption>
      </figure>
    )
  }
  return (
    <div
      aria-hidden="true"
      className="relative grid aspect-[4/3] place-items-center overflow-hidden border border-line bg-surface"
    >
      <div className="hairline-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] opacity-70" />
      <span className="relative grid size-28 place-items-center border border-fg bg-bg text-accent-ink shadow-elev">
        <ServiceIcon name={service.icon} size={44} />
      </span>
    </div>
  )
}

function ServiceNavLink({ service, direction }: { service: Service; direction: 'prev' | 'next' }) {
  const to = servicePath(service.slug)
  const Icon = direction === 'prev' ? ArrowLeft : ArrowRight
  return (
    <Link
      to={to}
      onPointerEnter={() => preloadRoute(to)}
      onFocus={() => preloadRoute(to)}
      className={`group/sn flex min-h-11 flex-col gap-2 py-6 ${direction === 'next' ? 'items-end text-right' : ''}`}
    >
      <span className="eyebrow inline-flex items-center gap-2">
        {direction === 'prev' ? <Icon size={14} aria-hidden="true" /> : null}
        {direction === 'prev' ? 'Previous service' : 'Next service'}
        {direction === 'next' ? <Icon size={14} aria-hidden="true" /> : null}
      </span>
      <span className="font-display text-xl font-bold uppercase sm:text-2xl">
        <span className="link-underline">{service.title}</span>
      </span>
    </Link>
  )
}

export default function ServiceDetail() {
  const { slug } = useParams()
  const service = getService(slug)
  if (!service) return <NotFound />

  const index = services.findIndex((s) => s.slug === service.slug)
  const prev = services[(index - 1 + services.length) % services.length]
  const next = services[(index + 1) % services.length]
  const stack = technologyGroups
    .filter((g) => service.stackGroups.includes(g.label))
    .flatMap((g) => g.items)
  const project = service.example ? getProject(service.example.projectSlug) : undefined
  const projectIndex = project ? projects.findIndex((p) => p.slug === project.slug) : -1

  let section = 0
  const nextIndex = () => ++section

  return (
    <>
      <Seo
        title={service.title}
        description={`${service.summary} ${service.outcome}`}
        path={servicePath(service.slug)}
        jsonLd={serviceJsonLd(service)}
      />
      <PageHero
        eyebrow={`Service ${pad(index + 1)} / ${pad(services.length)}`}
        title={service.title}
        mutedWords={1}
        intro={service.summary}
      >
        <Reveal onMount delay={sequence.heroSub} className="mt-10 flex flex-wrap gap-3">
          <ButtonLink to={`/contact?service=${service.slug}`} arrow>
            Discuss this service
          </ButtonLink>
          <ButtonLink to="/services" variant="secondary">
            All services
          </ButtonLink>
        </Reveal>
      </PageHero>

      <section aria-labelledby="included-title" className="py-24 sm:py-32">
        <div className="container-content grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <h2 id="included-title">
              <IndexLabel index={nextIndex()}>What&apos;s included</IndexLabel>
            </h2>
            <Stagger as="ol" className="mt-8 border-t border-line">
              {service.bullets.map((b, i) => (
                <StaggerItem
                  as="li"
                  key={b}
                  direction="right"
                  className="grid grid-cols-[auto_1fr] items-baseline gap-6 border-b border-line py-5"
                >
                  <span aria-hidden="true" className="font-mono text-xs text-muted tabular-nums">
                    {pad(i + 1)}
                  </span>
                  <span className="font-display text-xl font-bold uppercase sm:text-2xl">{b}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <Reveal direction="left" className="self-start lg:col-span-6">
            <Visual service={service} />
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="outcome-title" className="border-t border-line py-24 sm:py-32">
        <div className="container-content grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-3 lg:pt-3">
            <h2 id="outcome-title">
              <IndexLabel index={nextIndex()}>What you get</IndexLabel>
            </h2>
          </div>
          <Reveal className="lg:col-span-9">
            <p className="display text-statement">{service.outcome}</p>
          </Reveal>
        </div>
      </section>

      {stack.length > 0 ? (
        <section aria-labelledby="tools-title" className="border-t border-line py-24 sm:py-32">
          <div className="container-content grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3 lg:pt-1">
              <h2 id="tools-title">
                <IndexLabel index={nextIndex()}>Tools we use</IndexLabel>
              </h2>
            </div>
            <Stagger as="ul" className="flex flex-wrap gap-3 lg:col-span-9">
              {stack.map((item) => (
                <StaggerItem
                  as="li"
                  key={item}
                  distance={12}
                  className="inline-flex min-h-14 items-center gap-3 border border-line bg-surface px-4 py-3 text-sm"
                >
                  <TechLogo name={item} size={22} />
                  {item}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="delivery-title" className="border-t border-line py-24 sm:py-32">
        <div className="container-content">
          <SectionHeader
            layout="split"
            index={nextIndex()}
            id="delivery-title"
            eyebrow="How we deliver it"
            title="From brief to launch, in clear steps."
            mutedWords={3}
          />
          <Stagger
            as="ol"
            className="mt-16 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:mt-20 lg:grid-cols-5"
          >
            {processSteps.map((step, i) => (
              <StaggerItem as="li" key={step.title} className="bg-bg p-6 sm:p-7">
                <span className="font-mono text-xs text-accent-ink tabular-nums">{pad(i + 1)}</span>
                <h3 className="mt-10 text-lg tracking-[0.06em]">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {project ? (
        <section aria-labelledby="related-title" className="border-t border-line py-24 sm:py-32">
          <div className="container-content grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-3 lg:pt-1">
              <h2 id="related-title">
                <IndexLabel index={nextIndex()}>Related work</IndexLabel>
              </h2>
            </div>
            <div className="lg:col-span-9">
              <ProjectCard project={project} index={projectIndex} />
            </div>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="more-title" className="border-t border-line py-24 sm:py-32">
        <div className="container-content">
          <h2 id="more-title">
            <IndexLabel index={nextIndex()}>Other services</IndexLabel>
          </h2>
          <ul className="mt-8 grid border-t border-l border-line sm:grid-cols-2 lg:grid-cols-4">
            {services
              .filter((s) => s.slug !== service.slug)
              .map((s) => {
                const to = servicePath(s.slug)
                return (
                  <li key={s.slug} className="border-r border-b border-line">
                    <Link
                      to={to}
                      onPointerEnter={() => preloadRoute(to)}
                      onFocus={() => preloadRoute(to)}
                      className="group/os flex h-full min-h-32 flex-col justify-between gap-6 p-5 transition-colors duration-[var(--dur-micro)] hover:bg-surface"
                    >
                      <span className="flex items-center justify-between text-accent-ink">
                        <ServiceIcon name={s.icon} size={18} />
                        <ArrowRight
                          size={16}
                          aria-hidden="true"
                          className="text-fg transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/os:translate-x-1"
                        />
                      </span>
                      <span className="font-display text-base leading-snug font-bold tracking-[0.04em] uppercase">
                        {s.title}
                      </span>
                    </Link>
                  </li>
                )
              })}
            <li className="border-r border-b border-line bg-surface">
              <Link
                to="/services"
                onPointerEnter={() => preloadRoute('/services')}
                onFocus={() => preloadRoute('/services')}
                className="group/os flex h-full min-h-32 flex-col justify-between gap-6 p-5"
              >
                <span className="eyebrow">Overview</span>
                <span className="inline-flex items-center gap-2 font-display text-base leading-snug font-bold tracking-[0.04em] uppercase">
                  <span className="link-underline">All services</span>
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/os:translate-x-1"
                  />
                </span>
              </Link>
            </li>
          </ul>
          {prev && next ? (
            <nav
              aria-label="Previous and next service"
              className="mt-12 grid gap-4 border-t border-line sm:grid-cols-2"
            >
              <ServiceNavLink service={prev} direction="prev" />
              <ServiceNavLink service={next} direction="next" />
            </nav>
          ) : null}
        </div>
      </section>
    </>
  )
}
