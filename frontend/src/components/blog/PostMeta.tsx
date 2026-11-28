import { formatDate, type PostSummary } from '@/data/posts'
import { cn } from '@/lib/cn'

/** "Engineering / 6 min read" label used above post titles. */
export function PostEyebrow({
  post,
  className,
  prefix,
}: {
  post: PostSummary
  className?: string
  prefix?: string
}) {
  return (
    <p className={cn('eyebrow flex flex-wrap items-center gap-x-2 gap-y-1', className)}>
      {prefix ? (
        <>
          <span className="text-accent-ink">{prefix}</span>
          <span aria-hidden="true">/</span>
        </>
      ) : null}
      <span className={prefix ? undefined : 'text-accent-ink'}>{post.category}</span>
      <span aria-hidden="true">/</span>
      <span>{post.readingMinutes} min read</span>
    </p>
  )
}

export function PostDate({ post, className }: { post: PostSummary; className?: string }) {
  return (
    <time dateTime={post.publishedAt} className={cn('font-mono text-xs text-muted', className)}>
      {formatDate(post.publishedAt)}
    </time>
  )
}
