import { PostCard } from '@/components/blog/PostCard'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { TextLink } from '@/components/ui/TextLink'
import { posts } from '@/data/posts'

/** The three newest blog posts. Renders nothing until the first post is published. */
export function LatestPosts({ index }: { index: number }) {
  const latest = posts.slice(0, 3)
  if (latest.length === 0) return null
  return (
    <section aria-labelledby="blog-title" className="relative border-t border-line py-28">
      <div className="container-content">
        <SectionHeader
          id="blog-title"
          index={index}
          eyebrow="Blog"
          title="Latest articles."
          mutedWords={1}
          intro={
            <TextLink to="/blog" arrow>
              Read the blog
            </TextLink>
          }
        />
        <ul className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {latest.map((p, i) => (
            <li key={p.slug} className={i === 2 ? 'md:hidden lg:block' : undefined}>
              <PostCard post={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
