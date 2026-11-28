import { m } from 'framer-motion'
import { NavLink, useLocation } from 'react-router-dom'
import { navItems } from '@/config/routes'
import { LayoutFeatures } from '@/motion/LayoutFeatures'
import { spring } from '@/motion/tokens'
import { useMotionPreference } from '@/motion/useMotionPreference'
import { preloadRoute } from '@/routes/preload'

/** Desktop navigation. The active underline glides between links via layoutId. */
export function NavLinks() {
  const { pathname } = useLocation()
  const pref = useMotionPreference()
  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {navItems.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`)
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onPointerEnter={() => preloadRoute(item.to)}
                onFocus={() => preloadRoute(item.to)}
                className="relative inline-flex min-h-11 items-center px-3.5 text-xs font-medium tracking-[0.2em] text-fg/70 uppercase transition-colors duration-[var(--dur-micro)] hover:text-fg aria-[current=page]:text-fg"
              >
                {item.label}
                {active ? (
                  <LayoutFeatures>
                    <m.span
                      layoutId="nav-underline"
                      transition={pref === 'reduced' ? { duration: 0 } : spring.snappy}
                      aria-hidden="true"
                      className="absolute right-3.5 bottom-2.5 left-3.5 h-px bg-fg"
                    />
                  </LayoutFeatures>
                ) : null}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
