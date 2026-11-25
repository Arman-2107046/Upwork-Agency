import { ArrowRight } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { preloadRoute } from '@/routes/preload'

type Variant = 'primary' | 'secondary'

interface CommonProps {
  children: ReactNode
  variant?: Variant
  className?: string
  /** Show a trailing arrow that nudges on hover. */
  arrow?: boolean
}

function Inner({ children, arrow }: { children: ReactNode; arrow?: boolean }) {
  return (
    <>
      <span className="inline-flex items-center gap-2">{children}</span>
      {arrow ? (
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/btn:translate-x-1"
        />
      ) : null}
    </>
  )
}

/** Internal route link styled as a button. */
export function ButtonLink({
  to,
  children,
  variant = 'primary',
  className,
  arrow,
}: CommonProps & { to: string }) {
  return (
    <Link
      to={to}
      onPointerEnter={() => preloadRoute(to)}
      onFocus={() => preloadRoute(to)}
      className={cn('btn group/btn', `btn-${variant}`, className)}
    >
      <Inner arrow={arrow}>{children}</Inner>
    </Link>
  )
}

/** External link styled as a button. Opens in a new tab with a visible hint for screen readers. */
export function ButtonAnchor({
  href,
  children,
  variant = 'primary',
  className,
  arrow,
  newTab = true,
}: CommonProps & { href: string; newTab?: boolean }) {
  return (
    <a
      href={href}
      {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn('btn group/btn', `btn-${variant}`, className)}
    >
      <Inner arrow={arrow}>{children}</Inner>
      {newTab ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  )
}

export function Button({
  children,
  variant = 'primary',
  className,
  arrow,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn('btn group/btn', `btn-${variant}`, className)} {...rest}>
      <Inner arrow={arrow}>{children}</Inner>
    </button>
  )
}
