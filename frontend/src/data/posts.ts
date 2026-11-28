import { getContent } from '@/content/load'
import type { Post, PostAuthor, PostSummary, TocItem } from '@/content/types'

export type { Post, PostAuthor, PostSummary, TocItem }

/** Live blog posts, newest first (Content > Blog posts in the admin). */
export const posts: PostSummary[] = getContent().posts ?? []

export const blogPath = (slug: string) => `/blog/${slug}`

export function getPostSummary(slug: string | undefined): PostSummary | undefined {
  return posts.find((p) => p.slug === slug)
}

/** The post that leads the blog page: the newest featured one, else the newest. */
export const leadPost: PostSummary | undefined = posts.find((p) => p.featured) ?? posts[0]

/** Categories in use, most posts first. */
export const categories: { slug: string; label: string; count: number }[] = Object.values(
  posts.reduce<Record<string, { slug: string; label: string; count: number }>>((acc, p) => {
    const entry = (acc[p.categorySlug] ??= { slug: p.categorySlug, label: p.category, count: 0 })
    entry.count += 1
    return acc
  }, {}),
).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

/** Up to `limit` posts to read next: same category first, then shared tags, then newest. */
export function relatedPosts(post: PostSummary, limit = 3): PostSummary[] {
  const score = (p: PostSummary) =>
    (p.categorySlug === post.categorySlug ? 10 : 0) +
    p.tags.filter((t) => post.tags.includes(t)).length
  return posts
    .filter((p) => p.slug !== post.slug)
    .map((p, i) => ({ p, s: score(p), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, limit)
    .map(({ p }) => p)
}

const dateFormat = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso))
}

/** The post embedded in the page by the server (first load or admin preview), if any. */
function inlinePost(): Post | undefined {
  const text = document.getElementById('post-content')?.textContent
  if (!text) return undefined
  try {
    return JSON.parse(text) as Post
  } catch {
    return undefined
  }
}

const cache = new Map<string, Post>()
const inline = inlinePost()
if (inline) cache.set(inline.slug, inline)

/** Synchronously available post (embedded or already fetched). */
export function cachedPost(slug: string): Post | undefined {
  return cache.get(slug)
}

/** Loads a post with its body from the API, once per session. */
export async function loadPost(slug: string, signal?: AbortSignal): Promise<Post | null> {
  const hit = cache.get(slug)
  if (hit) return hit
  const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`GET /api/posts/${slug} responded with ${res.status}`)
  const post = (await res.json()) as Post
  cache.set(slug, post)
  return post
}
