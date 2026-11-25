import { Seo } from '@/components/seo/Seo'
import { PageHero } from '@/components/sections/PageHero'
import { ProjectCard } from '@/components/sections/ProjectCard'
import { ButtonLink } from '@/components/ui/Button'
import { projects } from '@/data/projects'
import { Reveal } from '@/motion/Reveal'

export default function Work() {
  return (
    <>
      <Seo
        title="Work"
        description="Selected projects: CustomTailor.store, an interactive tailoring platform, and ShirtsMockup Store, a digital store for apparel PSD mockups."
        path="/work"
      />
      <PageHero
        eyebrow="Work"
        title="Selected projects."
        mutedWords={1}
        intro="Product configurators and digital stores, designed and built end to end."
      />
      <section aria-label="Projects" className="container-content py-24">
        <ul className="grid gap-x-8 gap-y-16 md:grid-cols-2">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <ProjectCard project={p} index={i} headingLevel="h2" />
            </li>
          ))}
        </ul>
        <Reveal className="mt-24 flex flex-col items-start gap-6 border-t border-line pt-12 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl font-display text-title">Have a project in mind?</p>
          <ButtonLink to="/contact" arrow>
            Start a project
          </ButtonLink>
        </Reveal>
      </section>
    </>
  )
}
