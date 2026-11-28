import { useEffect, useState } from 'react'
import type { TocItem } from '@/data/posts'
import { cn } from '@/lib/cn'
import { scrollToId } from '@/lib/scroll'
import { useLenis } from '@/motion/lenis-context'
import { useMotionPreference } from '@/motion/useMotionPreference'

/** Sections above this line (px from the top of the viewport) count as being read. */
const READ_LINE = 160

/** The heading currently being read: the last one whose top has passed the read line. */
function useActiveHeading(items: TocItem[]): string | undefined {
  const [active, setActive] = useState(items[0]?.id)
  useEffect(() => {
    if (items.length === 0) return
    let frame = 0
    const update = () => {
      frame = 0
      let current = items[0]?.id
      for (const item of items) {
        const el = document.getElementById(item.id)
        if (el && el.getBoundingClientRect().top <= READ_LINE) current = item.id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items])
  return active
}

interface TableOfContentsProps {
  items: TocItem[]
  className?: string
  /** Called after a link is followed (closes the mobile disclosure). */
  onNavigate?: () => void
}

/** "On this page" outline. The section being read is marked on the rail and with aria-current. */
export function TableOfContents({ items, className, onNavigate }: TableOfContentsProps) {
  const active = useActiveHeading(items)
  const lenis = useLenis()
  const smooth = useMotionPreference() === 'full'
  // Section number of each h2 ("01", "02"), matching the numbers above the headings.
  const numbers = new Map(
    items.filter((i) => i.level === 2).map((i, n) => [i.id, String(n + 1).padStart(2, '0')]),
  )

  return (
    <ol className={cn('border-l border-line', className)}>
      {items.map((item) => {
        const isActive = item.id === active
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={isActive ? 'location' : undefined}
              onClick={(e) => {
                e.preventDefault()
                if (scrollToId(item.id, lenis, smooth)) {
                  history.replaceState(null, '', `#${item.id}`)
                  onNavigate?.()
                }
              }}
              className={cn(
                '-ml-px flex min-h-11 items-baseline gap-3 border-l py-2 pr-2 text-sm leading-snug transition-[color,border-color] duration-[var(--dur-micro)]',
                item.level === 3 ? 'pl-9' : 'pl-4',
                isActive
                  ? 'border-accent text-fg'
                  : 'border-transparent text-muted hover:border-line-strong hover:text-fg',
              )}
            >
              {item.level === 2 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'w-5 shrink-0 font-mono text-[0.625rem] tabular-nums',
                    isActive ? 'text-accent-ink' : 'text-muted',
                  )}
                >
                  {numbers.get(item.id)}
                </span>
              ) : null}
              <span>{item.text}</span>
            </a>
          </li>
        )
      })}
    </ol>
  )
}
