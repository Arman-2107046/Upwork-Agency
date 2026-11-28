import { ArrowLeft, ArrowRight, ChevronDown, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArticleBody } from '@/components/blog/ArticleBody'
import { AuthorAvatar } from '@/components/blog/AuthorAvatar'
import { AuthorCard } from '@/components/blog/AuthorCard'
import { Comments } from '@/components/blog/Comments'
import { CommentCountLink, LikeButton } from '@/components/blog/Engagement'
import { PostCard } from '@/components/blog/PostCard'
import { PostDate } from '@/components/blog/PostMeta'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { StaffEditButton } from '@/components/blog/StaffEdit'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { Seo } from '@/components/seo/Seo'
import { blogPostingJsonLd } from '@/components/seo/jsonLd'
import { HeroGrid } from '@/components/sections/HeroGrid'
import { ButtonLink } from '@/components/ui/Button'
import { Media } from '@/components/ui/Media'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Spinner } from '@/components/ui/Spinner'
import { Tag } from '@/components/ui/Tag'
import { TextLink } from '@/components/ui/TextLink'
import { absoluteUrl } from '@/config/site'
import { useEngagement } from '@/hooks/useEngagement'
import {
  blogPath,
  categoryPath,
  cachedPost,
  getPostSummary,
  loadPost,
  posts,
  relatedPosts,
  type Post,
  type PostSummary,
} from '@/data/posts'
import { ImageReveal } from '@/motion/ImageReveal'
import { Reveal } from '@/motion/Reveal'
import { SplitText } from '@/motion/SplitText'
import { sequence } from '@/motion/tokens'
import { preloadRoute } from '@/routes/preload'
import NotFound from './NotFound'

type BodyState =
  | { status: 'ready'; post: Post }
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error' }

/** The post body: embedded in the page on first load, fetched on in-app navigation. */
function usePostBody(slug: string): [BodyState, () => void] {
  const initial = (): BodyState => {
    const hit = cachedPost(slug)
    return hit ? { status: 'ready', post: hit } : { status: 'loading' }
  }
  const [state, setState] = useState<BodyState>(initial)
  const [attempt, setAttempt] = useState(0)
  const [lastSlug, setLastSlug] = useState(slug)
  if (lastSlug !== slug) {
    setLastSlug(slug)
    setState(initial())
  }

  useEffect(() => {
    if (cachedPost(slug)) return
    const controller = new AbortController()
    loadPost(slug, controller.signal)
      .then((post) => setState(post ? { status: 'ready', post } : { status: 'missing' }))
      .catch((error: unknown) => {
        if ((error as Error).name !== 'AbortError') setState({ status: 'error' })
      })
    return () => controller.abort()
  }, [slug, attempt])

  return [
    state,
    () => {
      setState({ status: 'loading' })
      setAttempt((n) => n + 1)
    },
  ]
}

function BodySkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <span className="flex items-center gap-3 text-sm text-muted">
        <Spinner />
        Loading the article
      </span>
      {[92, 100, 86, 97, 64].map((w, i) => (
        <div key={i} className="h-4 animate-pulse bg-surface-2" style={{ width: `${w}%` }} />
      ))}
      <div className="h-8" />
      {[100, 90, 95, 72].map((w, i) => (
        <div key={i} className="h-4 animate-pulse bg-surface-2" style={{ width: `${w}%` }} />
      ))}
    </div>
  )
}

function MobileToc({ post }: { post: Post }) {
  const [open, setOpen] = useState(false)
  if (post.toc.length < 2) return null
  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="group/toc mb-12 border border-line lg:hidden"
    >
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 [&::-webkit-details-marker]:hidden">
        <span className="eyebrow">On this page</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="transition-transform duration-[var(--dur-base)] group-open/toc:rotate-180"
        />
      </summary>
      <TableOfContents items={post.toc} className="mx-5 mb-4" onNavigate={() => setOpen(false)} />
    </details>
  )
}

function Neighbour({ post, direction }: { post: PostSummary; direction: 'newer' | 'older' }) {
  const to = blogPath(post.slug)
  const Icon = direction === 'newer' ? ArrowLeft : ArrowRight
  return (
    <Link
      to={to}
      onPointerEnter={() => preloadRoute(to)}
      onFocus={() => preloadRoute(to)}
      className={`group/n flex min-h-11 flex-col gap-3 py-6 ${direction === 'older' ? 'sm:items-end sm:text-right' : ''}`}
    >
      <span className="eyebrow inline-flex items-center gap-2">
        {direction === 'newer' ? <Icon size={14} aria-hidden="true" /> : null}
        {direction === 'newer' ? 'Newer article' : 'Older article'}
        {direction === 'older' ? <Icon size={14} aria-hidden="true" /> : null}
      </span>
      <span className="display max-w-md text-title">
        <span className="link-underline">{post.title}</span>
      </span>
    </Link>
  )
}

export default function BlogPost() {
  const { slug = '' } = useParams()
  const [body, retry] = usePostBody(slug)
  const summary: PostSummary | undefined =
    getPostSummary(slug) ?? (body.status === 'ready' ? body.post : undefined)

  const post = body.status === 'ready' ? body.post : undefined
  // Views, likes and comments only count on public posts (not admin previews).
  const [engagement, setEngagement] = useEngagement(slug, Boolean(post && !post.draft))

  // Every live post is listed in the site content; drafts arrive embedded with a preview link.
  if (!summary || body.status === 'missing') return <NotFound />

  const url = absoluteUrl(blogPath(summary.slug))
  const index = posts.findIndex((p) => p.slug === summary.slug)
  const newer = index > 0 ? posts[index - 1] : undefined
  const older = index >= 0 ? posts[index + 1] : undefined
  const related = relatedPosts(summary)
  const shareImage = post?.shareImage ? absoluteUrl(post.shareImage) : undefined
  const commentCount = engagement?.comments ?? post?.comments.length ?? 0

  return (
    <>
      <Seo
        title={post?.seoTitle ?? summary.title}
        description={post?.seoDescription ?? summary.excerpt}
        path={blogPath(summary.slug)}
        image={shareImage ?? summary.cover.src}
        imageIsCard={Boolean(shareImage)}
        type="article"
        noindex={post?.draft}
        article={{
          publishedTime: summary.publishedAt,
          modifiedTime: summary.updatedAt,
          section: summary.category,
          tags: summary.tags,
          author: summary.author?.name,
        }}
        jsonLd={post ? blogPostingJsonLd(post) : undefined}
      />

      <header className="relative overflow-hidden border-b border-line">
        <HeroGrid />
        <div className="container-content relative pt-[calc(var(--spacing-header)+64px)] pb-16 sm:pt-[calc(var(--spacing-header)+96px)] sm:pb-20">
          {post?.draft ? (
            <Reveal
              as="p"
              onMount
              distance={8}
              className="mb-8 inline-flex items-center gap-3 border border-accent px-4 py-2 text-sm text-accent-ink"
            >
              <Eye size={16} aria-hidden="true" />
              Preview. This post is not public yet.
            </Reveal>
          ) : null}
          <Reveal onMount distance={12}>
            <nav aria-label="Breadcrumb">
              <ol className="eyebrow flex flex-wrap items-center gap-2">
                <li>
                  <Link to="/blog" className="link-underline hover:text-fg">
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    to={categoryPath(summary.categorySlug)}
                    className="link-underline text-accent-ink"
                  >
                    {summary.category}
                  </Link>
                </li>
              </ol>
            </nav>
          </Reveal>
          <SplitText
            as="h1"
            onMount
            text={summary.title}
            className="mt-6 max-w-5xl text-display sm:text-[clamp(2.5rem,1.6rem+3vw,4.25rem)]"
          />
          <Reveal
            onMount
            delay={sequence.pageIntro}
            className="mt-8 max-w-3xl text-lead text-muted"
          >
            <p>{summary.excerpt}</p>
          </Reveal>
          <Reveal
            onMount
            delay={sequence.pageIntro + 0.08}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            {summary.author ? (
              <span className="flex items-center gap-3">
                <AuthorAvatar author={summary.author} size="md" />
                <span className="text-sm leading-tight">
                  <span className="block font-medium">{summary.author.name}</span>
                  {summary.author.role ? (
                    <span className="block text-muted">{summary.author.role}</span>
                  ) : null}
                </span>
              </span>
            ) : null}
            <span className="flex items-center gap-8 border-line sm:border-l sm:pl-8">
              <PostDate post={summary} />
              <span className="font-mono text-xs text-muted">
                {summary.readingMinutes} min read
              </span>
            </span>
            <StaffEditButton slug={summary.slug} />
          </Reveal>
        </div>
      </header>

      <div className="container-content pt-12 sm:pt-16">
        {summary.cover.src ? (
          <figure>
            <ImageReveal onMount className="border border-line bg-surface-2">
              <Media image={summary.cover} priority sizes="(min-width: 1200px) 1200px, 100vw" />
            </ImageReveal>
            {summary.coverCaption ? (
              <figcaption className="mt-3 font-mono text-xs text-muted">
                {summary.coverCaption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        <div className="mt-14 grid gap-12 sm:mt-20 lg:grid-cols-12 lg:gap-8">
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-[calc(var(--spacing-header)+24px)] space-y-10">
              {post && post.toc.length > 1 ? (
                <nav aria-label="On this page">
                  <p className="eyebrow mb-4">On this page</p>
                  <TableOfContents items={post.toc} />
                </nav>
              ) : null}
              <div>
                <p className="eyebrow mb-4">Share</p>
                <ShareButtons url={url} title={summary.title} image={shareImage} />
              </div>
            </div>
          </aside>

          <article className="min-w-0 lg:col-span-8 lg:col-start-5 xl:col-span-7 xl:col-start-5">
            {post ? <MobileToc post={post} /> : null}
            {body.status === 'ready' ? (
              <ArticleBody html={body.post.html} />
            ) : body.status === 'error' ? (
              <div role="alert" className="border border-line p-8">
                <p className="display text-title">The article didn&rsquo;t load.</p>
                <p className="mt-3 text-muted">Check your connection, then try again.</p>
                <button type="button" onClick={retry} className="btn btn-secondary group/btn mt-6">
                  Try again
                </button>
              </div>
            ) : (
              <BodySkeleton />
            )}

            {summary.tags.length > 0 ? (
              <div className="mt-16 border-t border-line pt-8">
                <p className="eyebrow mb-4">Tags</p>
                <ul className="flex flex-wrap gap-2">
                  {summary.tags.map((tag) => (
                    <li key={tag}>
                      <Link to={`/blog?q=${encodeURIComponent(tag)}`} className="group/tag">
                        <Tag className="transition-colors duration-[var(--dur-micro)] group-hover/tag:border-fg">
                          {tag}
                        </Tag>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {post && !post.draft ? (
              <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-8">
                <LikeButton slug={summary.slug} engagement={engagement} onChange={setEngagement} />
                <CommentCountLink count={commentCount} />
              </div>
            ) : null}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8 lg:hidden">
              <p className="eyebrow">Share this article</p>
              <ShareButtons url={url} title={summary.title} image={shareImage} />
            </div>

            {summary.author ? <AuthorCard author={summary.author} className="mt-12" /> : null}

            {post && !post.draft ? (
              <Comments slug={summary.slug} comments={post.comments} className="mt-16" />
            ) : null}
          </article>
        </div>

        {newer || older ? (
          <nav
            aria-label="More articles"
            className="mt-24 grid border-y border-line sm:grid-cols-2 sm:divide-x sm:divide-line"
          >
            <div className="sm:pr-8">
              {newer ? <Neighbour post={newer} direction="newer" /> : null}
            </div>
            <div className="border-t border-line sm:border-t-0 sm:pl-8">
              {older ? <Neighbour post={older} direction="older" /> : null}
            </div>
          </nav>
        ) : null}

        {related.length > 0 ? (
          <section aria-labelledby="related-title" className="mt-24">
            <SectionHeader
              id="related-title"
              eyebrow="Keep reading"
              title="Related articles."
              mutedWords={1}
              intro={
                <TextLink to="/blog" arrow>
                  All articles
                </TextLink>
              }
            />
            <ul className="mt-12 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <Reveal className="mt-28 mb-24 grid gap-10 border-t border-line pt-12 md:grid-cols-2 md:items-end">
          <p className="font-display text-display font-semibold">Have a project in mind?</p>
          <div className="md:text-right">
            <ButtonLink to="/contact" arrow>
              Start a project
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </>
  )
}
