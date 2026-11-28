import { ArrowLeft, Search, X } from 'lucide-react'
import { useId, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { FeaturedPost } from '@/components/blog/FeaturedPost'
import { PostCard } from '@/components/blog/PostCard'
import { Seo } from '@/components/seo/Seo'
import { PageHero } from '@/components/sections/PageHero'
import { ButtonLink } from '@/components/ui/Button'
import { pageSeo } from '@/data/pages'
import {
  categories,
  categoryDescription,
  categoryPath,
  getCategory,
  leadPost,
  posts,
  type BlogCategory,
  type PostSummary,
} from '@/data/posts'
import { cn } from '@/lib/cn'
import { Reveal } from '@/motion/Reveal'
import { sequence } from '@/motion/tokens'
import { preloadRoute } from '@/routes/preload'
import NotFound from './NotFound'

const PAGE_SIZE = 9

function matches(post: PostSummary, query: string): boolean {
  const haystack = [post.title, post.excerpt, post.category, ...post.tags].join(' ').toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
}

const articles = (n: number) => `${n} ${n === 1 ? 'article' : 'articles'}`

/** Category links (each category has its own page) and the search box. */
function Filters({
  category,
  query,
  onQuery,
  searchLabel,
}: {
  category: string
  query: string
  onQuery: (q: string) => void
  searchLabel: string
}) {
  const searchId = useId()
  // The search carries over when switching category.
  const search = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''
  return (
    <div className="flex flex-col gap-6 border-y border-line py-6 lg:flex-row lg:items-end lg:justify-between">
      {categories.length > 1 ? (
        <nav aria-label="Categories">
          <ul className="flex flex-wrap gap-2">
            {[{ slug: '', name: 'All', count: posts.length }, ...categories].map((c) => {
              const active = c.slug === category
              const to = categoryPath(c.slug) + search
              return (
                <li key={c.slug || 'all'}>
                  <Link
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    onPointerEnter={() => preloadRoute(to)}
                    className={cn(
                      'inline-flex min-h-11 items-center gap-2 border px-4 font-mono text-label tracking-[0.16em] uppercase transition-[color,background-color,border-color] duration-[var(--dur-micro)]',
                      active
                        ? 'border-fg bg-fg text-bg'
                        : 'border-line text-fg/80 hover:border-fg hover:text-fg',
                    )}
                  >
                    {c.name}
                    <span className={cn('tabular-nums', active ? 'text-bg/60' : 'text-muted')}>
                      {c.count}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      ) : (
        <span />
      )}
      <div className="w-full lg:w-80">
        <label htmlFor={searchId} className="eyebrow mb-2 block">
          {searchLabel}
        </label>
        <div className="relative">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Title, topic or tag"
            autoComplete="off"
            className="min-h-11 w-full border border-line bg-transparent py-2 pr-11 pl-10 text-sm transition-colors duration-[var(--dur-micro)] placeholder:text-muted hover:border-line-strong focus:border-fg focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQuery('')}
              aria-label="Clear search"
              title="Clear search"
              className="absolute top-0 right-0 grid size-11 place-items-center text-muted hover:text-fg"
            >
              <X size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function EmptyBlog() {
  return (
    <section aria-label="Articles" className="container-content py-24 sm:py-32">
      <Reveal className="mx-auto max-w-xl border border-line p-10 text-center sm:p-14">
        <p className="eyebrow">Coming soon</p>
        <p className="display mt-4 text-title">The first articles are on the way.</p>
        <p className="mt-4 text-muted">
          In the meantime, see what we have built or tell us about your project.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/work" arrow>
            See our work
          </ButtonLink>
          <ButtonLink to="/contact" variant="secondary">
            Start a project
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  )
}

function CategoryHero({ category }: { category: BlogCategory }) {
  return (
    <PageHero
      eyebrow="Blog category"
      title={category.name}
      intro={category.description ?? categoryDescription(category)}
    >
      <Reveal
        onMount
        delay={sequence.pageIntro + 0.08}
        className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
      >
        <Link
          to="/blog"
          onPointerEnter={() => preloadRoute('/blog')}
          className="group/back inline-flex min-h-11 items-center gap-2 font-mono text-label tracking-[0.16em] text-fg uppercase"
        >
          <ArrowLeft
            size={16}
            aria-hidden="true"
            className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/back:-translate-x-1"
          />
          <span className="link-underline">All articles</span>
        </Link>
        <span aria-hidden="true" className="h-4 w-px bg-line-strong" />
        <span className="font-mono text-label tracking-[0.16em] text-muted uppercase tabular-nums">
          {articles(category.count)}
        </span>
      </Reveal>
    </PageHero>
  )
}

export default function Blog() {
  const { category: categorySlug } = useParams()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const [shown, setShown] = useState(PAGE_SIZE)
  const current = getCategory(categorySlug)
  const category = current?.slug ?? ''
  const filtering = category !== '' || query.trim() !== ''

  const updateQuery = (q: string) => {
    const p = new URLSearchParams(params)
    if (q) p.set('q', q)
    else p.delete('q')
    setParams(p, { replace: true, preventScrollReset: true })
    setShown(PAGE_SIZE)
  }

  const results = posts.filter(
    (p) => (!category || p.categorySlug === category) && (!query.trim() || matches(p, query)),
  )

  // Old filter links (/blog?category=x) moved to the category pages.
  const legacy = params.get('category')
  if (!categorySlug && legacy !== null) {
    const q = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''
    return <Navigate to={(getCategory(legacy) ? categoryPath(legacy) : '/blog') + q} replace />
  }
  if (categorySlug && !current) return <NotFound />

  // Without filters the lead story sits above the grid, so the grid skips it.
  const grid = filtering ? results : results.filter((p) => p.slug !== leadPost?.slug)
  const visible = grid.slice(0, shown)

  return (
    <>
      {current ? (
        <Seo
          title={current.seoTitle ?? `${current.name} articles`}
          description={categoryDescription(current)}
          path={categoryPath(current.slug)}
        />
      ) : (
        <Seo title={pageSeo.blog.title} description={pageSeo.blog.description} path="/blog" />
      )}
      {current ? (
        <CategoryHero category={current} />
      ) : (
        <PageHero
          eyebrow="Blog"
          title="Notes from the build."
          mutedWords={2}
          intro="Practical writing on web development, e-commerce, product configurators and automation, from the team that builds them."
        />
      )}

      {posts.length === 0 ? (
        <EmptyBlog />
      ) : (
        <section
          aria-label={current ? `${current.name} articles` : 'Articles'}
          className="container-content py-20 sm:py-24"
        >
          {leadPost && !filtering ? (
            <div className="mb-20 sm:mb-24">
              <FeaturedPost post={leadPost} />
            </div>
          ) : null}

          {posts.length > 1 ? (
            <Filters
              category={category}
              query={query}
              onQuery={updateQuery}
              searchLabel={current ? `Search ${current.name}` : 'Search articles'}
            />
          ) : null}

          <p role="status" aria-live="polite" className="eyebrow mt-8">
            {query.trim()
              ? `${articles(results.length)} found`
              : current
                ? `Latest in ${current.name}`
                : grid.length > 0
                  ? 'More articles'
                  : ''}
          </p>

          {visible.length > 0 ? (
            <ul className="mt-8 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((p, i) => (
                <li key={p.slug}>
                  <PostCard post={p} headingLevel="h2" priority={Boolean(current) && i < 3} />
                </li>
              ))}
            </ul>
          ) : filtering ? (
            <div className="mt-8 border border-line p-10 text-center sm:p-14">
              <p className="display text-title">
                {query.trim() ? `Nothing matches “${query.trim()}”.` : 'No articles here yet.'}
              </p>
              <p className="mt-3 text-muted">
                {current
                  ? 'Try another word, or search all categories.'
                  : 'Try another word or category.'}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {query.trim() ? (
                  <button
                    type="button"
                    onClick={() => updateQuery('')}
                    className="btn btn-secondary group/btn"
                  >
                    Clear search
                  </button>
                ) : null}
                {current ? (
                  <ButtonLink
                    to={query.trim() ? `/blog?q=${encodeURIComponent(query.trim())}` : '/blog'}
                    variant="secondary"
                  >
                    Search all articles
                  </ButtonLink>
                ) : null}
              </div>
            </div>
          ) : null}

          {grid.length > shown ? (
            <div className="mt-16 flex justify-center">
              <button
                type="button"
                onClick={() => setShown((n) => n + PAGE_SIZE)}
                className="btn btn-secondary group/btn"
              >
                Show more articles
                <span className="font-mono text-muted tabular-nums">{grid.length - shown}</span>
              </button>
            </div>
          ) : null}
        </section>
      )}

      <section aria-label="Start a project" className="container-content pb-24">
        <Reveal className="flex flex-col items-start gap-6 border-t border-line pt-12 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl font-display text-title">
            Want this kind of thinking on your project?
          </p>
          <ButtonLink to="/contact" arrow>
            Start a project
          </ButtonLink>
        </Reveal>
      </section>
    </>
  )
}
