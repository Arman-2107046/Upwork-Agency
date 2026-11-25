import { AnimatePresence, m } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { navItems } from '@/config/routes'
import { site } from '@/config/site'
import { useLenis } from '@/motion/lenis-context'
import { duration, ease, sequence, stagger } from '@/motion/tokens'
import { reducedTransition } from '@/motion/variants'
import { useMotionPreference } from '@/motion/useMotionPreference'
import { ThemeToggle } from './ThemeToggle'
import { LogoLockup } from './Logo'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  /** Element that opened the menu; focus returns to it on close. */
  returnFocusTo: React.RefObject<HTMLButtonElement | null>
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Full-screen overlay menu: focus trap, Esc to close, body scroll locked while open. */
export function MobileMenu({ open, onClose, returnFocusTo }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const pref = useMotionPreference()

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    const prevOverflow = root.style.overflow
    root.style.overflow = 'hidden'
    lenis?.stop()
    const id = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    })
    const returnTarget = returnFocusTo.current
    return () => {
      cancelAnimationFrame(id)
      root.style.overflow = prevOverflow
      lenis?.start()
      returnTarget?.focus({ preventScroll: true })
    }
  }, [open, lenis, returnFocusTo])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }
    if (e.key !== 'Tab' || !panelRef.current) return
    const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (!first || !last) return
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const reduced = pref === 'reduced'
  const overlay = reduced
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: reducedTransition,
      }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: duration.micro * 1.5, ease: ease.inOut },
      }
  const item = reduced
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: reducedTransition } }
    : {
        hidden: { opacity: 0, y: 32 },
        show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.outExpo } },
      }

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          key="menu"
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-[75] flex flex-col overflow-y-auto bg-bg text-fg lg:hidden"
          {...overlay}
        >
          <div className="container-content flex h-header shrink-0 items-center justify-between">
            <Link to="/" onClick={onClose} className="inline-flex min-h-11 items-center">
              <LogoLockup />
              <span className="sr-only"> home</span>
            </Link>
            <button type="button" onClick={onClose} aria-label="Close menu" className="icon-btn">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <m.nav
            aria-label="Mobile"
            className="container-content flex flex-1 flex-col justify-center py-10"
            initial="hidden"
            animate="show"
            variants={{
              show: {
                transition: {
                  staggerChildren: reduced ? 0 : stagger.items,
                  delayChildren: reduced ? 0 : sequence.menuItems,
                },
              },
            }}
          >
            <ul className="flex flex-col border-t border-line">
              {[{ label: 'Home', to: '/' }, ...navItems].map((link, i) => (
                <m.li key={link.to} variants={item} className="border-b border-line py-2">
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    onClick={onClose}
                    className="group/m inline-flex min-h-11 items-baseline gap-4 font-display text-5xl font-bold text-fg uppercase aria-[current=page]:text-accent-ink sm:text-6xl"
                  >
                    <span aria-hidden="true" className="font-mono text-label text-muted">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {link.label}
                  </NavLink>
                </m.li>
              ))}
            </ul>
            <m.div variants={item} className="mt-12 flex flex-wrap items-center gap-4">
              <Link to="/contact" onClick={onClose} className="btn btn-primary">
                Start a project
              </Link>
              <ThemeToggle />
            </m.div>
            {site.email ? (
              <m.p variants={item} className="mt-8 font-mono text-xs tracking-[0.12em] text-muted">
                <a href={`mailto:${site.email}`} className="link-underline">
                  {site.email}
                </a>
              </m.p>
            ) : null}
          </m.nav>
        </m.div>
      ) : null}
    </AnimatePresence>
  )
}
