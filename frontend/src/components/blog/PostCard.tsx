import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Media } from '@/components/ui/Media'
import { blogPath, type PostSummary } from '@/data/posts'
import { cn } from '@/lib/cn'
import { ImageReveal } from '@/motion/ImageReveal'
import { preloadRoute } from '@/routes/preload'
import { PostDate, PostEyebrow } from './PostMeta'
import { StaffEditPencil } from './StaffEdit'

interface PostCardProps {
  post: PostSummary
  className?: string
  headingLevel?: 'h2' | 'h3'
  /** Above-the-fold cards load their image eagerly. */
  priority?: boolean
}

/** Blog post card: 16:10 cover, category and reading time, title, summary, date. One link. */
export function PostCard({ post, className, headingLevel = 'h3', priority }: PostCardProps) {
  const Heading = headingLevel
  const to = blogPath(post.slug)
  return (
    <article className={cn('group/card relative flex h-full flex-col', className)}>
      <ImageReveal className="aspect-[16/10] overflow-hidden border border-line bg-surface-2">
        <div className="h-full transition-transform duration-[var(--dur-reveal)] ease-[var(--ease-out-expo)] group-hover/card:scale-[1.04]">
          <Media
            image={post.cover}
            priority={priority}
            sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
          />
        </div>
      </ImageReveal>
      <StaffEditPencil slug={post.slug} title={post.title} />
      <PostEyebrow post={post} className="mt-6" />
      <Heading className="mt-3 text-title">
        <Link
          to={to}
          data-cursor="view"
          onPointerEnter={() => preloadRoute(to)}
          onFocus={() => preloadRoute(to)}
          className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-[var(--focus)] focus-visible:after:outline-solid"
        >
          {post.title}
        </Link>
      </Heading>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
      <div className="mt-auto flex items-center justify-between gap-4 pt-6">
        <PostDate post={post} />
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center border border-line transition-[transform,background-color,color] duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/card:translate-x-1 group-hover/card:-translate-y-1 group-hover/card:bg-fg group-hover/card:text-bg"
        >
          <ArrowUpRight size={16} />
        </span>
      </div>
    </article>
  )
}
