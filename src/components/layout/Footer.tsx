import { m } from 'framer-motion'
import { ArrowUp, ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { navItems } from '@/config/routes'
import { site } from '@/config/site'
import { closingLine } from '@/data/about'
import { servicePath, services } from '@/data/services'
import { useLenis } from '@/motion/lenis-context'
import { duration, ease } from '@/motion/tokens'
import { useMotionPreference } from '@/motion/useMotionPreference'
import { preloadRoute } from '@/routes/preload'
import { LogoLockup, LogoWordmark } from './Logo'

const pad = (n: number) => String(n).padStart(2, '0')

function BackToTop() {
  const lenis = useLenis()
  const pref = useMotionPreference()
  const onClick = () => {
    if (lenis && pref === 'full') lenis.scrollTo(0)
    else window.scrollTo({ top: 0, behavior: pref === 'full' ? 'smooth' : 'instant' })
    document.getElementById('main')?.focus({ preventScroll: true })
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/top inline-flex min-h-11 items-center gap-3 font-mono text-label tracking-[0.22em] text-muted uppercase transition-colors duration-[var(--dur-micro)] hover:text-fg"
    >
      Back to top
      <span className="grid size-9 place-items-center border border-line transition-colors duration-[var(--dur-micro)] group-hover/top:border-fg group-hover/top:bg-fg group-hover/top:text-bg">
        <ArrowUp
          size={14}
          aria-hidden="true"
          className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/top:-translate-y-0.5"
        />
      </span>
    </button>
  )
}

/** One footer column: mono label, then links with a small index and an underline on hover. */
function Column({
  title,
  className,
  children,
}: {
  title: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <h2 className="eyebrow mb-5 flex items-center gap-3 !font-mono">
        <span aria-hidden="true" className="h-px w-5 bg-accent" />
        {title}
      </h2>
      <ul className="flex flex-col">{children}</ul>
    </div>
  )
}

function FooterLink({
  to,
  href,
  index,
  external = false,
  children,
}: {
  to?: string
  href?: string
  index?: number
  external?: boolean
  children: ReactNode
}) {
  const cls =
    'group/fl flex min-h-11 items-baseline gap-3 py-1 text-sm leading-snug text-fg/75 transition-colors duration-[var(--dur-micro)] hover:text-fg'
  const inner = (
    <>
      {index !== undefined ? (
        <span
          aria-hidden="true"
          className="w-5 shrink-0 font-mono text-[0.625rem] text-muted tabular-nums"
        >
          {pad(index)}
        </span>
      ) : null}
      <span className="link-underline">{children}</span>
      {external ? (
        <>
          <ArrowUpRight
            size={13}
            aria-hidden="true"
            className="self-center transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/fl:translate-x-0.5 group-hover/fl:-translate-y-0.5"
          />
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      ) : null}
    </>
  )
  return (
    <li>
      {to ? (
        <Link
          to={to}
          onPointerEnter={() => preloadRoute(to)}
          onFocus={() => preloadRoute(to)}
          className={cls}
        >
          {inner}
        </Link>
      ) : (
        <a
          href={href}
          className={cls}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {inner}
        </a>
      )}
    </li>
  )
}

/** Oversized "bytecode." signature that rises into view. Decorative: the name is in the lockup. */
function Signature() {
  const pref = useMotionPreference()
  return (
    <div aria-hidden="true" className="@container overflow-hidden pt-6">
      <m.div
        // Sized to the container (cqw) so "bytecode." always spans the full content width.
        className="text-[23.2cqw] leading-[1.04] select-none"
        initial={pref === 'full' ? { y: '60%', opacity: 0 } : false}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: duration.hero, ease: ease.outExpo }}
      >
        <LogoWordmark className="-ml-[0.05em] block whitespace-nowrap" />
      </m.div>
    </div>
  )
}

export function Footer() {
  const year = new Date().getFullYear()
  const { pathname } = useLocation()
  // Home ends with its own call to action and Contact is the destination: skip the repeat.
  const showClosing = pathname !== '/' && pathname !== '/contact'
  const words = closingLine.split(' ')
  const head = words.slice(0, -1).join(' ')
  const tail = words.slice(-1).join(' ')

  return (
    <footer className="relative overflow-hidden border-t border-line">
      {/* Faint hairline grid fading in from the top right */}
      <div
        aria-hidden="true"
        className="hairline-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_85%_0%,black,transparent_60%)] opacity-60"
      />

      <div className="container-content relative">
        {showClosing ? (
          <div className="grid gap-10 border-b border-line py-20 sm:py-28 lg:grid-cols-12 lg:items-end lg:gap-8">
            <div className="lg:col-span-8">
              <p className="eyebrow mb-6 flex items-center gap-3">
                <span className="status-dot" aria-hidden="true" />
                Next step
              </p>
              <p className="display text-display">
                {head} <span className="text-fg-soft">{tail}</span>
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 lg:col-span-4 lg:items-end">
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <ButtonLink to="/contact" arrow>
                  Start a project
                </ButtonLink>
                {site.email ? (
                  <ButtonAnchor href={`mailto:${site.email}`} variant="secondary" newTab={false}>
                    Email us
                  </ButtonAnchor>
                ) : null}
              </div>
              <p className="eyebrow">We reply {site.responseTime}</p>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 sm:py-20 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <Link to="/" className="inline-flex min-h-11 items-center self-start">
              <LogoLockup size="lg" />
              <span className="sr-only"> home</span>
            </Link>
            <p className="max-w-xs text-sm text-muted">{site.tagline}</p>
            <p className="flex items-center gap-3 font-mono text-label tracking-[0.2em] text-muted uppercase">
              <span className="status-dot" aria-hidden="true" />
              Replies {site.responseTime}
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <Column title="Navigate">
              <FooterLink to="/" index={1}>
                Home
              </FooterLink>
              {navItems.map((item, i) => (
                <FooterLink key={item.to} to={item.to} index={i + 2}>
                  {item.label}
                </FooterLink>
              ))}
            </Column>
          </nav>

          <Column title="Services" className="lg:col-span-3">
            {services.map((s, i) => (
              <FooterLink key={s.slug} to={servicePath(s.slug)} index={i + 1}>
                {s.title}
              </FooterLink>
            ))}
          </Column>

          <Column title="Contact" className="lg:col-span-3">
            {site.email ? (
              <FooterLink href={`mailto:${site.email}`}>{site.email}</FooterLink>
            ) : null}
            {site.upworkUrl ? (
              <FooterLink href={site.upworkUrl} external>
                Hire us on Upwork
              </FooterLink>
            ) : null}
            <FooterLink to="/contact">Start a project</FooterLink>
            {site.social.map((s) => (
              <FooterLink key={s.href} href={s.href} external>
                {s.label}
              </FooterLink>
            ))}
          </Column>
        </div>

        <Signature />

        <div className="flex flex-col gap-4 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-label tracking-[0.22em] text-muted uppercase">
            &copy; {year} <span className="normal-case">{site.brandName}</span>
            <span aria-hidden="true" className="mx-3">
              /
            </span>
            All rights reserved
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  )
}
