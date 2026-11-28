import { site } from '@/config/site'
import { cn } from '@/lib/cn'

/**
 * Logo system: a prompt chevron and cursor in a rounded tile, the lowercase wordmark (the
 * short name, e.g. "kernel"), and a lockup of the two with the full name kept small.
 * Colors follow the theme: dark tile on light pages, light tile on dark pages; the cursor and
 * the wordmark dot are always the accent blue.
 */

const wordmark = site.shortName.toLowerCase()
const descriptor = site.brandName.split(' ').slice(1).join(' ')

export function LogoSymbol({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
    >
      <rect width="100" height="100" rx="24" fill="var(--fg)" />
      <polyline
        points="30,31 52,50 30,69"
        fill="none"
        stroke="var(--bg)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="58"
        y1="70"
        x2="74"
        y2="70"
        stroke="var(--accent)"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Type-only mark: the short name with a blue dot, e.g. "kernel.". */
export function LogoWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-sans font-semibold tracking-[-0.045em] lowercase', className)}>
      {wordmark}
      <span className="text-accent">.</span>
    </span>
  )
}

/** Symbol plus wordmark, with the descriptor in small tracked capitals. */
export function LogoLockup({ size = 'md', className }: { size?: 'md' | 'lg'; className?: string }) {
  const lg = size === 'lg'
  return (
    <span className={cn('inline-flex items-center', lg ? 'gap-4' : 'gap-3', className)}>
      <LogoSymbol size={lg ? 52 : 36} />
      <span className="flex flex-col">
        <span
          className={cn(
            'font-sans leading-none font-semibold tracking-[-0.045em] lowercase',
            lg ? 'text-[2.125rem]' : 'text-[1.5rem]',
          )}
        >
          {wordmark}
        </span>
        {descriptor ? (
          <span
            className={cn(
              'font-sans leading-none font-medium tracking-[0.34em] text-muted uppercase',
              lg ? 'mt-1.5 text-[0.625rem]' : 'mt-1 text-[0.5625rem]',
            )}
          >
            {descriptor}
          </span>
        ) : null}
      </span>
    </span>
  )
}
