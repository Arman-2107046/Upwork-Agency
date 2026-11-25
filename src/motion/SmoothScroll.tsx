import { cancelFrame, frame } from 'framer-motion'
import Lenis from 'lenis'
import { useEffect, useState, type ReactNode } from 'react'
import { FINE_POINTER, useMediaQuery } from '@/hooks/useMediaQuery'
import { LenisContext } from './lenis-context'
import { smoothScroll } from './tokens'
import { useMotionPreference } from './useMotionPreference'

/**
 * Lenis smooth scrolling for mouse wheels, driven by Framer Motion's frame loop so
 * useScroll-based effects read the same values in the same frame.
 * Off under prefers-reduced-motion and on devices without a fine pointer. Touch scrolling
 * is never intercepted (syncTouch: false).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const motion = useMotionPreference()
  const finePointer = useMediaQuery(FINE_POINTER)
  const enabled = motion === 'full' && finePointer
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (!enabled) return
    const instance = new Lenis({
      lerp: smoothScroll.lerp,
      wheelMultiplier: smoothScroll.wheelMultiplier,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
    })
    const update = ({ timestamp }: { timestamp: number }) => instance.raf(timestamp)
    frame.update(update, true)
    // Publishing the instance lets other components (menu, route changes) stop or reset it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance)
    return () => {
      cancelFrame(update)
      instance.destroy()
      setLenis(null)
    }
  }, [enabled])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
