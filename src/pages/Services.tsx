import { ArrowUpRight } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { servicesJsonLd } from '@/components/seo/jsonLd'
import { PageHero } from '@/components/sections/PageHero'
import { Media } from '@/components/ui/Media'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { getService, servicePath, services } from '@/data/services'
import { Stagger, StaggerItem } from '@/motion/Stagger'
import { preloadRoute } from '@/routes/preload'

const pad = (n: number) => String(n).padStart(2, '0')

/** Links from before each service had its own page used /services#slug: forward them. */
function useLegacyHashRedirect() {
  const { hash } = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    const service = getService(hash.slice(1))
    if (service) navigate(servicePath(service.slug), { replace: true })
  }, [hash, navigate])
}

export default function Services() {
  useLegacyHashRedirect()
  return (
    <>
      <Seo
        title="Services"
        description="E-commerce, web apps and SaaS, websites, AI chatbots, automation, databases, cloud deployment and graphic design, built end to end."
        path="/services"
        jsonLd={servicesJsonLd(services)}
      />
      <PageHero
        eyebrow="Services"
        title="Design, development and deployment, end to end."
        mutedWords={3}
        intro="Eight core services that cover a product from its first design file to the server it runs on. Pick one, or combine them."
      />

      <section aria-label="All services" className="py-24 sm:py-32">
        <Stagger as="ol" className="container-content border-t border-line">
          {services.map((s, i) => {
            const to = servicePath(s.slug)
            return (
              <StaggerItem as="li" key={s.slug} direction="up" distance={24}>
                <Link
                  to={to}
                  onPointerEnter={() => preloadRoute(to)}
                  onFocus={() => preloadRoute(to)}
                  className="group/row grid items-center gap-6 border-b border-line py-8 transition-colors duration-[var(--dur-micro)] sm:py-10 lg:grid-cols-12 lg:gap-8"
                >
                  <span className="flex items-center gap-5 lg:col-span-6">
                    <span aria-hidden="true" className="font-mono text-xs text-muted tabular-nums">
                      {pad(i + 1)}
                    </span>
                    <span className="font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.5rem)] leading-none font-bold uppercase transition-colors duration-[var(--dur-micro)] group-hover/row:text-accent-ink">
                      {s.title}
                    </span>
                  </span>
                  <span className="text-muted lg:col-span-4">{s.summary}</span>
                  <span className="flex items-center justify-between gap-4 lg:col-span-2 lg:justify-end">
                    {s.example ? (
                      <span
                        aria-hidden="true"
                        className="hidden w-28 overflow-hidden border border-line sm:block lg:hidden xl:block"
                      >
                        <Media image={{ ...s.example.image, alt: '' }} sizes="112px" />
                      </span>
                    ) : (
                      <span className="grid size-11 place-items-center border border-line text-accent-ink lg:hidden xl:grid">
                        <ServiceIcon name={s.icon} size={18} />
                      </span>
                    )}
                    <span
                      aria-hidden="true"
                      className="grid size-11 shrink-0 place-items-center border border-line transition-[background-color,color,transform] duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5 group-hover/row:bg-fg group-hover/row:text-bg"
                    >
                      <ArrowUpRight size={18} />
                    </span>
                  </span>
                </Link>
              </StaggerItem>
            )
          })}
        </Stagger>
      </section>
    </>
  )
}
