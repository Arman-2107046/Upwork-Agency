import { lazy, Suspense, useEffect, useState } from 'react'
import { FINE_POINTER, useMediaQuery } from '@/hooks/useMediaQuery'
import { PageTransition } from '@/motion/PageTransition'
import { useMotionPreference } from '@/motion/useMotionPreference'
import { Footer } from './Footer'
import { Grain } from './Grain'
import { Header } from './Header'
import { Intro } from './Intro'
import { SkipLink } from './SkipLink'

const CustomCursor = lazy(() => import('@/components/cursor/CustomCursor'))

/** Mount the cursor only after first paint, and only for mouse users with full motion. */
function useDeferredCursor(): boolean {
  const pref = useMotionPreference()
  const fine = useMediaQuery(FINE_POINTER)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = globalThis.setTimeout(() => setReady(true), 1200)
    return () => globalThis.clearTimeout(id)
  }, [])
  return ready && fine && pref === 'full'
}

export function RootLayout() {
  const showCursor = useDeferredCursor()
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main" tabIndex={-1} className="relative outline-none">
        <PageTransition />
      </main>
      <Footer />
      <Intro />
      <Grain />
      {showCursor ? (
        <Suspense fallback={null}>
          <CustomCursor />
        </Suspense>
      ) : null}
    </>
  )
}
