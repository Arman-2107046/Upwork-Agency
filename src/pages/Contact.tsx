import { Clock, Mail } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { ContactForm } from '@/components/sections/ContactForm'
import { PageHero } from '@/components/sections/PageHero'
import { ButtonAnchor } from '@/components/ui/Button'
import { site } from '@/config/site'
import { Reveal } from '@/motion/Reveal'
import { sequence } from '@/motion/tokens'

export default function Contact() {
  const [params] = useSearchParams()
  const service = params.get('service') ?? undefined

  return (
    <>
      <Seo
        title="Contact"
        description={`Tell us about your website, store, configurator, SaaS or automation project. We reply ${site.responseTime}.`}
        path="/contact"
      />
      <PageHero
        eyebrow="Contact"
        title="Start a project."
        mutedWords={1}
        intro="Tell us what you are building. A few lines are enough to get the conversation going."
      />
      <div className="container-content grid gap-16 py-24 lg:grid-cols-12">
        <section aria-label="Contact form" className="lg:col-span-7">
          <ContactForm key={service ?? 'none'} defaultService={service} />
        </section>
        <Reveal
          as="div"
          direction="left"
          delay={sequence.follow}
          className="lg:col-span-4 lg:col-start-9"
        >
          <aside
            aria-labelledby="direct-title"
            className="border border-line bg-surface p-7 sm:p-8"
          >
            <h2 id="direct-title" className="text-title">
              Prefer to reach us directly?
            </h2>
            <ul className="mt-6 flex flex-col gap-4 text-sm">
              {site.email ? (
                <li className="flex items-center gap-3">
                  <Mail size={18} aria-hidden="true" className="shrink-0 text-accent-ink" />
                  <a href={`mailto:${site.email}`} className="link-underline break-all">
                    {site.email}
                  </a>
                </li>
              ) : null}
              <li className="flex items-center gap-3 text-muted">
                <Clock size={18} aria-hidden="true" className="shrink-0 text-accent-ink" />
                We reply {site.responseTime}.
              </li>
            </ul>
            {site.upworkUrl ? (
              <ButtonAnchor href={site.upworkUrl} variant="secondary" className="mt-8 w-full">
                Hire us on Upwork
              </ButtonAnchor>
            ) : null}
          </aside>
        </Reveal>
      </div>
    </>
  )
}
