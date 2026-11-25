import { ArrowUpRight } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { projectJsonLd } from '@/components/seo/jsonLd'
import { PageHero } from '@/components/sections/PageHero'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { Media } from '@/components/ui/Media'
import { Tag } from '@/components/ui/Tag'
import { TextLink } from '@/components/ui/TextLink'
import { getProject, projects } from '@/data/projects'
import { ImageReveal } from '@/motion/ImageReveal'
import { Parallax } from '@/motion/Parallax'
import { Reveal } from '@/motion/Reveal'
import { Stagger, StaggerItem } from '@/motion/Stagger'
import { sequence } from '@/motion/tokens'
import NotFound from './NotFound'

function TagGroup({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div>
      <h2 className="eyebrow mb-4">{title}</h2>
      <Stagger as="ul" className="flex flex-wrap gap-2">
        {items.map((item) => (
          <StaggerItem as="li" key={item} distance={12}>
            <Tag>{item}</Tag>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  )
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = getProject(slug)
  if (!project) return <NotFound />

  const index = projects.findIndex((p) => p.slug === project.slug)
  const next = projects[(index + 1) % projects.length]

  return (
    <>
      <Seo
        title={project.title}
        description={project.overview}
        path={`/work/${project.slug}`}
        type="article"
        jsonLd={projectJsonLd(project)}
      />
      <PageHero eyebrow={project.category} title={project.title} intro={project.overview}>
        {project.url ? (
          <Reveal onMount delay={sequence.heroSub} className="mt-10">
            <ButtonAnchor href={project.url} variant="secondary">
              Visit {new URL(project.url).hostname}
              <ArrowUpRight size={16} aria-hidden="true" />
            </ButtonAnchor>
          </Reveal>
        ) : null}
      </PageHero>

      <div className="container-content py-20 sm:py-28">
        <ImageReveal onMount className="border border-line bg-surface-2">
          <Media image={project.cover} priority sizes="(min-width: 1200px) 1200px, 100vw" />
        </ImageReveal>

        <div className="mt-20 grid gap-12 md:grid-cols-2">
          <TagGroup title="Scope" items={project.scope} />
          <TagGroup title="Technologies" items={project.technologies} />
        </div>

        <section aria-labelledby="gallery-title" className="mt-24">
          <h2 id="gallery-title" className="eyebrow mb-8">
            Gallery
          </h2>
          <ul className="grid gap-8 md:grid-cols-2">
            {project.gallery.map((img, i) => (
              <li key={img.alt} className={i === 0 ? 'md:col-span-2' : undefined}>
                <Parallax speed={i % 2 === 0 ? 0.05 : -0.05}>
                  <ImageReveal className="border border-line bg-surface-2">
                    <Media
                      image={img}
                      sizes={i === 0 ? '100vw' : '(min-width: 768px) 50vw, 100vw'}
                    />
                  </ImageReveal>
                </Parallax>
              </li>
            ))}
          </ul>
        </section>

        <Reveal className="mt-28 grid gap-10 border-t border-line pt-12 md:grid-cols-2 md:items-end">
          <div>
            <p className="font-display text-display font-semibold">Planning something similar?</p>
            <div className="mt-8">
              <ButtonLink to="/contact" arrow>
                Start a project
              </ButtonLink>
            </div>
          </div>
          {next && next.slug !== project.slug ? (
            <div className="md:text-right">
              <p className="eyebrow mb-2">Next project</p>
              <TextLink
                to={`/work/${next.slug}`}
                arrow
                className="font-display text-title font-bold uppercase"
              >
                {next.title}
              </TextLink>
            </div>
          ) : null}
        </Reveal>
      </div>
    </>
  )
}
