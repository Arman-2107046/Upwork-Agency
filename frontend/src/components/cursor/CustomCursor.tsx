import { AnimatePresence, m, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { duration, ease, spring } from '@/motion/tokens'

type CursorMode = 'default' | 'link' | 'view' | 'hidden'

const INTERACTIVE = 'a, button, [role="button"], summary, label[for]'
const FORM_FIELD = 'input, textarea, select, [contenteditable="true"]'

/**
 * Desktop-only cursor: a dot plus a trailing ring that grows over links and buttons and
 * shows "View" over elements marked data-cursor="view". Mounted lazily, only for fine
 * pointers with full motion. The native cursor is restored over form fields.
 */
export default function CustomCursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, spring.soft)
  const ringY = useSpring(y, spring.soft)
  const [mode, setMode] = useState<CursorMode>('hidden')

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('has-custom-cursor')

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x.set(e.clientX)
      y.set(e.clientY)
      const target = e.target instanceof Element ? e.target : null
      if (!target || target.closest(FORM_FIELD)) setMode('hidden')
      else if (target.closest('[data-cursor="view"]')) setMode('view')
      else if (target.closest(INTERACTIVE)) setMode('link')
      else setMode('default')
    }
    const onLeave = () => setMode('hidden')

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      root.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [x, y])

  const ringScale = mode === 'view' ? 2.4 : mode === 'link' ? 1.6 : 1
  const visible = mode !== 'hidden'
  const t = { duration: duration.micro, ease: ease.outExpo }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80]">
      <m.div
        className="absolute top-0 left-0 -mt-1 -ml-1 size-2 rounded-full bg-accent"
        style={{ x, y }}
        animate={{ opacity: visible && mode !== 'view' ? 1 : 0 }}
        transition={t}
      />
      <m.div
        className="absolute top-0 left-0 -mt-5 -ml-5 grid size-10 place-items-center"
        style={{ x: ringX, y: ringY }}
      >
        <m.div
          className="absolute inset-0 rounded-full border border-accent"
          animate={{ scale: ringScale, opacity: visible ? 1 : 0 }}
          transition={t}
        />
        <m.div
          className="absolute inset-0 rounded-full bg-accent"
          animate={{ scale: ringScale, opacity: mode === 'view' ? 1 : 0 }}
          transition={t}
        />
        <AnimatePresence>
          {mode === 'view' ? (
            <m.span
              key="view"
              className="relative text-[10px] font-semibold tracking-[0.14em] text-ink uppercase"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={t}
            >
              View
            </m.span>
          ) : null}
        </AnimatePresence>
      </m.div>
    </div>
  )
}
