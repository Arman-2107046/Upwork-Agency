import { Heart, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { toggleLike, type Engagement } from '@/lib/blogApi'
import { cn } from '@/lib/cn'

/** Like toggle: updates at once and goes back if the request fails. */
export function LikeButton({
  slug,
  engagement,
  onChange,
}: {
  slug: string
  engagement: Engagement | null
  onChange: (next: Engagement) => void
}) {
  const [busy, setBusy] = useState(false)
  const liked = engagement?.liked ?? false
  const likes = engagement?.likes ?? 0

  const toggle = async () => {
    if (!engagement || busy) return
    const previous = engagement
    onChange({ ...engagement, liked: !liked, likes: Math.max(0, likes + (liked ? -1 : 1)) })
    setBusy(true)
    try {
      const result = await toggleLike(slug)
      onChange({ ...previous, ...result })
    } catch {
      onChange(previous)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!engagement}
      aria-pressed={liked}
      aria-label={
        liked ? `Liked. ${likes} likes. Remove your like` : `Like this article. ${likes} likes`
      }
      className={cn(
        'inline-flex min-h-11 items-center gap-2.5 border px-4 font-mono text-label tracking-[0.16em] uppercase transition-[color,border-color,background-color] duration-[var(--dur-micro)] disabled:opacity-60',
        liked
          ? 'border-accent text-accent-ink'
          : 'border-line text-fg/80 hover:border-fg hover:text-fg',
      )}
    >
      <Heart
        size={16}
        aria-hidden="true"
        className={cn(
          'transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)]',
          liked && 'scale-110 fill-current',
        )}
      />
      <span>{liked ? 'Liked' : 'Like'}</span>
      <span className="text-muted tabular-nums">{engagement ? likes : '–'}</span>
    </button>
  )
}

export function CommentCountLink({ count }: { count: number }) {
  return (
    <a
      href="#comments"
      className="inline-flex min-h-11 items-center gap-2.5 border border-line px-4 font-mono text-label tracking-[0.16em] text-fg/80 uppercase transition-[color,border-color] duration-[var(--dur-micro)] hover:border-fg hover:text-fg"
    >
      <MessageSquare size={16} aria-hidden="true" />
      <span className="tabular-nums">{count}</span>
      <span>{count === 1 ? 'Comment' : 'Comments'}</span>
    </a>
  )
}
