import { m, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { site } from '@/config/site'
import { cn } from '@/lib/cn'
import { ScrollProgress } from '@/motion/ScrollProgress'
import { duration, ease } from '@/motion/tokens'
import { useMotionPreference } from '@/motion/useMotionPreference'
import { MobileMenu } from './MobileMenu'
import { NavLinks } from './NavLinks'
import { ThemeToggle } from './ThemeToggle'
import { LogoLockup } from './Logo'

const HEADER_HEIGHT = 76
const SOLID_AFTER = 80

/**
 * Sticky header: hides on scroll down, returns on scroll up, background fades in after 80px.
 * The scroll progress bar sits on its bottom edge and stays visible at the top of the
 * viewport when the header hides.
 */
export function Header() {
  const { scrollY } = useScroll()
  const pref = useMotionPreference()
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [focusWithin, setFocusWithin] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0
    setSolid(latest > SOLID_AFTER)
    if (Math.abs(latest - prev) < 4) return
    setHidden(latest > prev && latest > HEADER_HEIGHT * 2)
  })

  // Close the menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setMenuOpen(false)
    setHidden(false)
  }

  useEffect(() => {
    if (!menuOpen) return
    const mql = window.matchMedia('(min-width: 1024px)')
    const onChange = () => mql.matches && setMenuOpen(false)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [menuOpen])

  const isHidden = hidden && !menuOpen && !focusWithin

  return (
    <>
      <m.div
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: isHidden ? -HEADER_HEIGHT : 0 }}
        transition={
          pref === 'reduced' ? { duration: 0 } : { duration: duration.base * 0.6, ease: ease.inOut }
        }
        onFocus={() => setFocusWithin(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false)
        }}
      >
        <header className="relative">
          <m.div
            aria-hidden="true"
            className="absolute inset-0 border-b border-line bg-bg"
            initial={false}
            animate={{ opacity: solid ? 1 : 0 }}
            transition={{ duration: duration.micro * 1.5, ease: ease.outExpo }}
          />
          <div className="container-content relative flex h-header items-center justify-between gap-4">
            <Link to="/" className="inline-flex min-h-11 items-center">
              <LogoLockup />
              <span className="sr-only"> home</span>
            </Link>
            <NavLinks />
            <div className="flex items-center gap-3">
              <p className="mr-2 hidden items-center gap-3 font-mono text-label tracking-[0.2em] text-muted uppercase xl:flex">
                <span className="status-dot" aria-hidden="true" />
                Replies {site.responseTime}
              </p>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <Link
                to="/contact"
                className="btn btn-secondary hidden !min-h-11 !px-5 sm:inline-flex"
              >
                Start a project
              </Link>
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label="Open menu"
                className={cn('icon-btn lg:hidden')}
              >
                <Menu size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>
        <ScrollProgress />
      </m.div>
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        returnFocusTo={menuButtonRef}
      />
    </>
  )
}
