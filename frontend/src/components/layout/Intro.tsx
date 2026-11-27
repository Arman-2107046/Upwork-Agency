import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useState } from 'react'
import { duration, ease } from '@/motion/tokens'
import { useMotionPreference } from '@/motion/useMotionPreference'
import { LogoWordmark } from './Logo'

const KEY = 'intro-seen'

function seenThisSession(): boolean {
  try {
    return sessionStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}

function markSeen(): void {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    // Storage unavailable: the intro simply shows again next time.
  }
}

/**
 * Branded wordmark reveal (900ms), once per session. Decorative: the page renders and
 * loads underneath, the overlay never blocks first render, and any click or key skips it.
 */
export function Intro() {
  const pref = useMotionPreference()
  const [show, setShow] = useState(() => pref === 'full' && !seenThisSession())

  useEffect(() => {
    if (!show) return
    markSeen()
    const skip = () => setShow(false)
    const timer = window.setTimeout(skip, duration.intro * 1000)
    window.addEventListener('keydown', skip)
    window.addEventListener('pointerdown', skip)
    window.addEventListener('wheel', skip, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('wheel', skip)
    }
  }, [show])

  return (
    <AnimatePresence>
      {show ? (
        <m.div
          key="intro"
          aria-hidden="true"
          className="fixed inset-0 z-[85] grid place-items-center bg-bg text-fg"
          exit={{ y: '-100%', transition: { duration: duration.base, ease: ease.inOut } }}
          onClick={() => setShow(false)}
        >
          <div className="flex flex-col items-center gap-8">
            <div className="overflow-hidden pb-2">
              <m.p
                className="text-[clamp(3.5rem,10vw,7rem)] leading-none"
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: duration.intro * 0.7, ease: ease.outExpo }}
              >
                <LogoWordmark />
              </m.p>
            </div>
            <m.div
              className="h-px w-40 origin-left bg-accent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: duration.intro, ease: ease.inOut }}
            />
          </div>
        </m.div>
      ) : null}
    </AnimatePresence>
  )
}
