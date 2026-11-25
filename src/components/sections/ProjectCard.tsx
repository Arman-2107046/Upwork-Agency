import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Media } from '@/components/ui/Media'
import type { Project } from '@/data/projects'
import { cn } from '@/lib/cn'
import { ImageReveal } from '@/motion/ImageReveal'
import { preloadRoute } from '@/routes/preload'

interface ProjectCardProps {
  project: Project
  index: number
  className?: string
  headingLevel?: 'h2' | 'h3'
}

/** Project card with clip-path image reveal; the whole card is one link with a "View" cursor. */
export function ProjectCard({ project, index, className, headingLevel = 'h3' }: ProjectCardProps) {
  const Heading = headingLevel
  const to = `/work/${project.slug}`
  return (
    <article className={cn('group/card relative', className)}>
      <ImageReveal className="border border-line bg-surface-2">
        <div className="transition-transform duration-[var(--dur-reveal)] ease-[var(--ease-out-expo)] group-hover/card:scale-[1.03]">
          <Media image={project.cover} sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>
      </ImageReveal>
      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <p className="eyebrow">
            <span className="text-accent-ink">{String(index + 1).padStart(2, '0')}</span> /{' '}
            {project.category}
          </p>
          <Heading className="mt-3 text-title">
            <Link
              to={to}
              data-cursor="view"
              onPointerEnter={() => preloadRoute(to)}
              onFocus={() => preloadRoute(to)}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-[var(--focus)] focus-visible:after:outline-solid"
            >
              {project.title}
            </Link>
          </Heading>
        </div>
        <span
          aria-hidden="true"
          className="mt-1 grid size-11 shrink-0 place-items-center border border-line transition-[transform,background-color,color] duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/card:translate-x-1 group-hover/card:-translate-y-1 group-hover/card:bg-fg group-hover/card:text-bg"
        >
          <ArrowUpRight size={18} />
        </span>
      </div>
    </article>
  )
}
