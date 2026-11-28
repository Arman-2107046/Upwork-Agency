import type { PostAuthor } from '@/data/posts'
import { cn } from '@/lib/cn'
import { AuthorAvatar } from './AuthorAvatar'

/** "Written by" block at the end of a post. */
export function AuthorCard({ author, className }: { author: PostAuthor; className?: string }) {
  return (
    <section
      aria-label="About the author"
      className={cn(
        'flex flex-col gap-6 border border-line bg-surface p-6 sm:flex-row sm:p-8',
        className,
      )}
    >
      <AuthorAvatar author={author} size="lg" />
      <div>
        <p className="eyebrow">Written by</p>
        <p className="display mt-2 text-title">{author.name}</p>
        {author.role ? <p className="mt-1 text-sm text-muted">{author.role}</p> : null}
        {author.bio ? (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-fg/80">{author.bio}</p>
        ) : null}
      </div>
    </section>
  )
}
