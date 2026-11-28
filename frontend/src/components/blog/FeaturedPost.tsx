import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Media } from '@/components/ui/Media'
import { blogPath, type PostSummary } from '@/data/posts'
import { ImageReveal } from '@/motion/ImageReveal'
import { Reveal } from '@/motion/Reveal'
import { sequence } from '@/motion/tokens'
import { preloadRoute } from '@/routes/preload'
import { AuthorAvatar } from './AuthorAvatar'
import { PostDate, PostEyebrow } from './PostMeta'

/** The lead story at the top of the blog: wide cover beside a display title. One link. */
export function FeaturedPost({ post }: { post: PostSummary }) {
  const to = blogPath(post.slug)
  return (
    <article className="group/card relative grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
      <ImageReveal
        onMount
        className="aspect-[16/10] overflow-hidden border border-line bg-surface-2 lg:col-span-7"
      >
        <div className="h-full transition-transform duration-[var(--dur-reveal)] ease-[var(--ease-out-expo)] group-hover/card:scale-[1.03]">
          <Media
            image={post.cover}
            priority
            sizes="(min-width: 1200px) 700px, (min-width: 1024px) 58vw, 100vw"
          />
        </div>
      </ImageReveal>
      <Reveal onMount delay={sequence.pageIntro} className="lg:col-span-5">
        <PostEyebrow post={post} prefix={post.featured ? 'Featured' : 'Latest'} />
        <h2 className="mt-5 text-[clamp(1.875rem,1.4rem+1.6vw,2.75rem)] leading-[1.02]">
          <Link
            to={to}
            data-cursor="view"
            onPointerEnter={() => preloadRoute(to)}
            onFocus={() => preloadRoute(to)}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-[var(--focus)] focus-visible:after:outline-solid"
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-6 text-lead text-muted">{post.excerpt}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-line pt-6">
          {post.author ? (
            <span className="flex items-center gap-3">
              <AuthorAvatar author={post.author} />
              <span className="text-sm leading-tight">
                <span className="block font-medium">{post.author.name}</span>
                {post.author.role ? (
                  <span className="block text-muted">{post.author.role}</span>
                ) : null}
              </span>
            </span>
          ) : null}
          <PostDate post={post} />
          <span
            aria-hidden="true"
            className="ml-auto inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase"
          >
            Read
            <ArrowRight
              size={16}
              className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/card:translate-x-1"
            />
          </span>
        </div>
      </Reveal>
    </article>
  )
}
