import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { preloadRoute } from '@/routes/preload'

/** Inline text link with an underline that draws left to right. */
export function TextLink({
  to,
  children,
  className,
  arrow = false,
}: {
  to: string
  children: ReactNode
  className?: string
  arrow?: boolean
}) {
  return (
    <Link
      to={to}
      onPointerEnter={() => preloadRoute(to)}
      onFocus={() => preloadRoute(to)}
      className={cn(
        'group/link inline-flex min-h-11 items-center gap-2 text-sm font-medium',
        className,
      )}
    >
      <span className="link-underline">{children}</span>
      {arrow ? (
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/link:translate-x-1 group-focus-visible/link:translate-x-1"
        />
      ) : null}
    </Link>
  )
}
