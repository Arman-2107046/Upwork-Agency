import { Seo } from '@/components/seo/Seo'
import { PageHero } from '@/components/sections/PageHero'
import { ProjectCard } from '@/components/sections/ProjectCard'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { IndexLabel, SectionHeader } from '@/components/ui/SectionHeader'
import { site } from '@/config/site'
import { aboutStatement, howWeWork, teamRoles } from '@/data/about'
import { pageSeo } from '@/data/pages'
import { projects } from '@/data/projects'
import { Reveal } from '@/motion/Reveal'
import { SpotlightCard } from '@/motion/SpotlightCard'
import { Stagger, StaggerItem } from '@/motion/Stagger'
import { TextScrollFill } from '@/motion/TextScrollFill'

export default function About() {
  const { yearsExperience, upworkBadge } = site.claims
  const claims = [
    yearsExperience
      ? { value: yearsExperience, label: 'years of creative design expertise' }
      : null,
    upworkBadge
      ? { value: 'Upwork', label: 'established agency with extensive project experience' }
      : null,
  ].filter((c): c is { value: string; label: string } => c !== null)

  return (
    <>
      <Seo title={pageSeo.about.title} description={pageSeo.about.description} path="/about" />
      <PageHero eyebrow="About" title="Design craft meets modern engineering." mutedWords={2} />

      <section aria-labelledby="about-statement" className="py-24 sm:py-32">
        <div className="container-content grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-3 lg:pt-3">
            <h2 id="about-statement">
              <IndexLabel index={1}>Who we are</IndexLabel>
            </h2>
          </div>
          <div className="lg:col-span-9">
            <TextScrollFill
              text={aboutStatement}
              keepCase={site.brandName.split(' ')}
              className="display text-statement"
            />

            {claims.length > 0 ? (
              <Stagger as="dl" className="mt-20 border-t border-line">
                {claims.map((c) => (
                  <StaggerItem
                    key={c.label}
                    className="grid gap-2 border-b border-line py-6 sm:grid-cols-3 sm:items-baseline"
                  >
                    <dt className="eyebrow">{c.label}</dt>
                    <dd className="font-display text-3xl font-bold uppercase sm:col-span-2">
                      {c.value}
                    </dd>
                  </StaggerItem>
                ))}
              </Stagger>
            ) : null}
          </div>
        </div>
      </section>

      <section aria-labelledby="recent-title" className="border-t border-line py-24 sm:py-32">
        <div className="container-content">
          <SectionHeader
            layout="split"
            index={2}
            id="recent-title"
            eyebrow="Recent work"
            title="Built and shipped by our team."
            mutedWords={3}
          />
          <ul className="mt-16 grid gap-10 md:grid-cols-2 lg:mt-20">
            {projects.slice(0, 4).map((p, i) => (
              <li key={p.slug}>
                <ProjectCard project={p} index={i} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="how-title" className="border-t border-line py-24 sm:py-32">
        <div className="container-content">
          <SectionHeader
            layout="split"
            index={3}
            id="how-title"
            eyebrow="How we work"
            title="Transparent from the first commit."
            mutedWords={3}
          />
          <Stagger
            as="ol"
            className="mt-16 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:mt-20 lg:grid-cols-4"
          >
            {howWeWork.map((item, i) => (
              <StaggerItem as="li" key={item.title} className="bg-bg p-7">
                <span className="font-mono text-xs text-accent-ink tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-10 text-lg tracking-[0.06em]">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section aria-labelledby="team-title" className="border-t border-line py-24 sm:py-32">
        <div className="container-content">
          <SectionHeader
            layout="split"
            index={4}
            id="team-title"
            eyebrow="Team"
            title="One multidisciplinary team."
            mutedWords={1}
            intro="Every project is staffed with the roles it needs."
          />
          <Stagger as="ul" className="mt-16 grid gap-4 md:grid-cols-3 lg:mt-20">
            {teamRoles.map((role, i) => (
              <StaggerItem
                as="li"
                key={role.title}
                direction={i % 2 === 0 ? 'right' : 'left'}
                className="h-full"
              >
                <SpotlightCard className="h-full bg-bg p-7">
                  <span aria-hidden="true" className="font-mono text-xs text-muted tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-10 text-title">{role.title}</h3>
                  <p className="mt-4 text-sm text-muted">{role.text}</p>
                </SpotlightCard>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-16 flex flex-wrap gap-4">
            <ButtonLink to="/contact" arrow>
              Start a project
            </ButtonLink>
            {site.upworkUrl ? (
              <ButtonAnchor href={site.upworkUrl} variant="secondary">
                View our Upwork profile
              </ButtonAnchor>
            ) : null}
          </Reveal>
        </div>
      </section>
    </>
  )
}
