import { AnimatePresence, m } from 'framer-motion'
import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { scrollToId, scrollToTop } from '@/lib/scroll'
import { useLenis } from './lenis-context'
import { distance, duration, ease } from './tokens'
import { reducedTransition } from './variants'
import { useMotionPreference } from './useMotionPreference'

/** Keeps the outgoing route rendered while it animates out. */
function FrozenOutlet() {
  const outlet = useOutlet()
  const [frozen] = useState<ReactNode>(outlet)
  return <>{frozen}</>
}

function focusHeading() {
  const h1 = document.querySelector<HTMLElement>('main h1')
  if (!h1) return
  if (!h1.hasAttribute('tabindex')) h1.setAttribute('tabindex', '-1')
  h1.focus({ preventScroll: true })
}

/**
 * Route transition: fast fade + slide (exit and enter together stay under 500ms).
 * After the old page leaves, scroll resets to the top (or to the #hash target) and focus
 * moves to the new page's h1 so screen readers announce the change.
 */
export function PageTransition() {
  const location = useLocation()
  const lenis = useLenis()
  const pref = useMotionPreference()
  const initialKey = useRef(location.key)

  // First load: the initial page is not focused, but a deep link with a #hash
  // still lands on its section once the lazy route has rendered.
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''))
    if (!hash) return
    let frames = 0
    let raf = 0
    const tryScroll = () => {
      if (scrollToId(hash, null, false) || ++frames > 120) return
      raf = requestAnimationFrame(tryScroll)
    }
    raf = requestAnimationFrame(tryScroll)
    return () => cancelAnimationFrame(raf)
  }, [])

  const reduced = pref === 'reduced'
  const variants = reduced
    ? {
        initial: { opacity: 0 },
        enter: { opacity: 1, transition: reducedTransition },
        exit: { opacity: 0, transition: reducedTransition },
      }
    : {
        initial: { opacity: 0, y: distance.pageShift },
        enter: {
          opacity: 1,
          y: 0,
          transition: { duration: duration.pageEnter, ease: ease.outExpo },
        },
        exit: {
          opacity: 0,
          y: -distance.pageShift / 2,
          transition: { duration: duration.pageExit, ease: ease.inOut },
        },
      }

  const onExitComplete = () => {
    scrollToTop(lenis)
  }

  const onEntered = () => {
    if (location.key === initialKey.current) return
    const hash = decodeURIComponent(location.hash.replace(/^#/, ''))
    if (hash && scrollToId(hash, lenis, false)) return
    focusHeading()
  }

  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={onExitComplete}>
      <m.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
        onAnimationComplete={(def) => {
          if (def === 'enter') onEntered()
        }}
      >
        <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
          <FrozenOutlet />
        </Suspense>
      </m.div>
    </AnimatePresence>
  )
}
