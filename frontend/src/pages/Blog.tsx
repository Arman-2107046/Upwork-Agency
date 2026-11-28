import { Search, X } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FeaturedPost } from '@/components/blog/FeaturedPost'
import { PostCard } from '@/components/blog/PostCard'
import { Seo } from '@/components/seo/Seo'
import { PageHero } from '@/components/sections/PageHero'
import { ButtonLink } from '@/components/ui/Button'
import { pageSeo } from '@/data/pages'
import { categories, leadPost, posts, type PostSummary } from '@/data/posts'
import { cn } from '@/lib/cn'
import { Reveal } from '@/motion/Reveal'

const PAGE_SIZE = 9

function matches(post: PostSummary, query: string): boolean {
  const haystack = [post.title, post.excerpt, post.category, ...post.tags].join(' ').toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
}

function Filters({
  category,
  query,
  onCategory,
  onQuery,
}: {
  category: string
  query: string
  onCategory: (slug: string) => void
  onQuery: (q: string) => void
}) {
  const searchId = useId()
  return (
    <div className="flex flex-col gap-6 border-y border-line py-6 lg:flex-row lg:items-end lg:justify-between">
      {categories.length > 1 ? (
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {[{ slug: '', label: 'All', count: posts.length }, ...categories].map((c) => {
            const active = c.slug === category
            return (
              <button
                key={c.slug || 'all'}
                type="button"
                aria-pressed={active}
                onClick={() => onCategory(c.slug)}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 border px-4 font-mono text-label tracking-[0.16em] uppercase transition-[color,background-color,border-color] duration-[var(--dur-micro)]',
                  active
                    ? 'border-fg bg-fg text-bg'
                    : 'border-line text-fg/80 hover:border-fg hover:text-fg',
                )}
              >
                {c.label}
                <span className={cn('tabular-nums', active ? 'text-bg/60' : 'text-muted')}>
                  {c.count}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <span />
      )}
      <div className="w-full lg:w-80">
        <label htmlFor={searchId} className="eyebrow mb-2 block">
          Search articles
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

export default function Blog() {
  const [params, setParams] = useSearchParams()
  const category = categories.some((c) => c.slug === params.get('category'))
    ? (params.get('category') ?? '')
    : ''
  const query = params.get('q') ?? ''
  const [shown, setShown] = useState(PAGE_SIZE)
  const filtering = category !== '' || query.trim() !== ''

  const update = (next: { category?: string; q?: string }) => {
    const p = new URLSearchParams(params)
    for (const [key, value] of Object.entries(next)) {
      if (value) p.set(key, value)
      else p.delete(key)
    }
    setParams(p, { replace: true, preventScrollReset: true })
    setShown(PAGE_SIZE)
  }

  const results = useMemo(
    () =>
      posts.filter(
        (p) => (!category || p.categorySlug === category) && (!query.trim() || matches(p, query)),
      ),
    [category, query],
  )
  // Without filters the lead story sits above the grid, so the grid skips it.
  const grid = filtering ? results : results.filter((p) => p.slug !== leadPost?.slug)
  const visible = grid.slice(0, shown)

  return (
    <>
      <Seo title={pageSeo.blog.title} description={pageSeo.blog.description} path="/blog" />
      <PageHero
        eyebrow="Blog"
        title="Notes from the build."
        mutedWords={2}
        intro="Practical writing on web development, e-commerce, product configurators and automation, from the team that builds them."
      />

      {posts.length === 0 ? (
        <EmptyBlog />
      ) : (
        <section aria-label="Articles" className="container-content py-20 sm:py-24">
          {leadPost && !filtering ? (
            <div className="mb-20 sm:mb-24">
              <FeaturedPost post={leadPost} />
            </div>
          ) : null}

          {posts.length > 1 ? (
            <Filters
              category={category}
              query={query}
              onCategory={(slug) => update({ category: slug })}
              onQuery={(q) => update({ q })}
            />
          ) : null}

          <p role="status" aria-live="polite" className="eyebrow mt-8">
            {filtering
              ? `${results.length} ${results.length === 1 ? 'article' : 'articles'} found`
              : grid.length > 0
                ? 'More articles'
                : ''}
          </p>

          {visible.length > 0 ? (
            <ul className="mt-8 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((p) => (
                <li key={p.slug}>
                  <PostCard post={p} headingLevel="h2" />
                </li>
              ))}
            </ul>
          ) : filtering ? (
            <div className="mt-8 border border-line p-10 text-center sm:p-14">
              <p className="display text-title">
                {query.trim() ? `Nothing matches “${query.trim()}”.` : 'No articles here yet.'}
              </p>
              <p className="mt-3 text-muted">Try another word or category.</p>
              <button
                type="button"
                onClick={() => update({ category: '', q: '' })}
                className="btn btn-secondary group/btn mt-8"
              >
                Show all articles
              </button>
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
