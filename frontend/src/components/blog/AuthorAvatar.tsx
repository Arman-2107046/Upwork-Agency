import type { PostAuthor } from '@/data/posts'
import { cn } from '@/lib/cn'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '')).toUpperCase()
}

const sizes = {
  sm: 'size-10 text-[0.6875rem]',
  md: 'size-11 text-xs',
  lg: 'size-20 text-base',
}

/** Square author photo, or the author's initials on a hairline tile. Decorative: the name is always shown beside it. */
export function AuthorAvatar({
  author,
  size = 'sm',
  className,
}: {
  author: PostAuthor
  size?: keyof typeof sizes
  className?: string
}) {
  if (author.avatar?.src) {
    return (
      <img
        src={author.avatar.src}
        srcSet={author.avatar.srcSet}
        sizes="96px"
        alt=""
        width={author.avatar.width}
        height={author.avatar.height}
        loading="lazy"
        decoding="async"
        className={cn(sizes[size], 'shrink-0 border border-line object-cover', className)}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        sizes[size],
        'grid shrink-0 place-items-center border border-line bg-surface-2 font-mono tracking-[0.12em] text-fg/80',
        className,
      )}
    >
      {initials(author.name)}
    </span>
  )
}
