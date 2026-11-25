import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'
import { useMotionPreference } from '@/motion/useMotionPreference'

/** Points on the sphere (Fibonacci lattice), accent nodes and the arcs that link them. */
const POINTS = 1100
const NODES = [41, 212, 377, 530, 688, 845, 1003]
const ARCS: [number, number][] = [
  [0, 2],
  [2, 4],
  [4, 6],
  [1, 3],
  [3, 5],
  [5, 0],
]
const TILT = 0.38
const SPIN = 0.07 // radians per second
const ARC_STEPS = 32

type Vec = [number, number, number]

const lattice: Vec[] = Array.from({ length: POINTS }, (_, i) => {
  const y = 1 - (i / (POINTS - 1)) * 2
  const r = Math.sqrt(1 - y * y)
  const phi = i * Math.PI * (3 - Math.sqrt(5))
  return [Math.cos(phi) * r, y, Math.sin(phi) * r]
})

function slerp(a: Vec, b: Vec, t: number): Vec {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
  const omega = Math.acos(dot)
  if (omega < 1e-4) return a
  const s = Math.sin(omega)
  const k1 = Math.sin((1 - t) * omega) / s
  const k2 = Math.sin(t * omega) / s
  // Lift the arc off the surface so it reads as a link, not a seam.
  const lift = 1 + 0.18 * Math.sin(Math.PI * t)
  return [
    (a[0] * k1 + b[0] * k2) * lift,
    (a[1] * k1 + b[1] * k2) * lift,
    (a[2] * k1 + b[2] * k2) * lift,
  ]
}

const arcPaths: Vec[][] = ARCS.map(([a, b]) => {
  const pa = lattice[NODES[a] ?? 0] ?? [0, 0, 1]
  const pb = lattice[NODES[b] ?? 0] ?? [0, 0, 1]
  return Array.from({ length: ARC_STEPS + 1 }, (_, i) => slerp(pa, pb, i / ARC_STEPS))
})

function readColors() {
  const cs = getComputedStyle(document.documentElement)
  return {
    fg: cs.getPropertyValue('--fg').trim() || '#0a0a0b',
    accent: cs.getPropertyValue('--accent').trim() || '#c8a86b',
  }
}

/**
 * Decorative dotted globe on a 2D canvas (no WebGL). It starts after first paint, pauses
 * while off screen or in a background tab, and draws a single still frame under reduced
 * motion.
 */
export function HeroGlobe({ className }: { className?: string }) {
  const pref = useMotionPreference()
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !wrap || !ctx) return

    let colors = readColors()
    let size = 0
    let raf = 0
    let running = false
    let visible = true
    let angle = 0.6
    let last = 0
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
    const animate = pref === 'full'

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      size = wrap.clientWidth
      canvas.width = Math.round(size * dpr)
      canvas.height = Math.round(size * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (time: number) => {
      const R = size * 0.4
      const cx = size / 2
      const cy = size / 2
      const tilt = TILT + pointer.y * 0.12
      const spin = angle + pointer.x * 0.25
      const cosA = Math.cos(spin)
      const sinA = Math.sin(spin)
      const cosT = Math.cos(tilt)
      const sinT = Math.sin(tilt)

      const project = ([x, y, z]: Vec): Vec => {
        const x1 = x * cosA + z * sinA
        const z1 = -x * sinA + z * cosA
        const y2 = y * cosT - z1 * sinT
        const z2 = y * sinT + z1 * cosT
        return [cx + x1 * R, cy + y2 * R, z2]
      }

      ctx.clearRect(0, 0, size, size)

      // Orbit ring behind and in front of the sphere.
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(-0.32)
      ctx.strokeStyle = colors.fg
      ctx.globalAlpha = 0.16
      ctx.lineWidth = 1
      ctx.setLineDash([2, 5])
      ctx.beginPath()
      ctx.ellipse(0, 0, R * 1.32, R * 0.36, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
      const orbitT = time * 0.00018
      ctx.globalAlpha = 1
      ctx.fillStyle = colors.accent
      ctx.fillRect(Math.cos(orbitT) * R * 1.32 - 2.5, Math.sin(orbitT) * R * 0.36 - 2.5, 5, 5)
      ctx.restore()

      // Sphere outline.
      ctx.globalAlpha = 0.22
      ctx.strokeStyle = colors.fg
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.stroke()

      // Dots: square, larger and darker on the near side.
      ctx.fillStyle = colors.fg
      for (const p of lattice) {
        const [sx, sy, z] = project(p)
        const near = (z + 1) / 2
        ctx.globalAlpha = 0.06 + near * near * 0.62
        const d = 0.9 + near * 1.3
        ctx.fillRect(sx - d / 2, sy - d / 2, d, d)
      }

      // Arcs between accent nodes, with a travelling packet on each.
      ctx.strokeStyle = colors.accent
      ctx.lineWidth = 1.25
      arcPaths.forEach((path, k) => {
        ctx.beginPath()
        let drawing = false
        for (const v of path) {
          const [sx, sy, z] = project(v)
          if (z > -0.05) {
            if (drawing) ctx.lineTo(sx, sy)
            else ctx.moveTo(sx, sy)
            drawing = true
          } else drawing = false
        }
        ctx.globalAlpha = 0.85
        ctx.stroke()
        const t = (time * 0.00016 + k / ARCS.length) % 1
        const head = path[Math.floor(t * ARC_STEPS)]
        if (head) {
          const [hx, hy, hz] = project(head)
          if (hz > -0.05) {
            ctx.globalAlpha = 1
            ctx.fillStyle = colors.accent
            ctx.fillRect(hx - 2, hy - 2, 4, 4)
          }
        }
      })

      // Accent nodes with a thin square frame.
      NODES.forEach((idx) => {
        const p = lattice[idx]
        if (!p) return
        const [sx, sy, z] = project(p)
        if (z < 0) return
        ctx.globalAlpha = 1
        ctx.fillStyle = colors.accent
        ctx.fillRect(sx - 3, sy - 3, 6, 6)
        ctx.globalAlpha = 0.5
        ctx.strokeStyle = colors.accent
        ctx.lineWidth = 1
        ctx.strokeRect(sx - 7.5, sy - 7.5, 15, 15)
      })
      ctx.globalAlpha = 1
    }

    const frame = (time: number) => {
      const dt = last ? Math.min(64, time - last) : 16
      last = time
      angle += (SPIN * dt) / 1000
      pointer.x += (pointer.tx - pointer.x) * 0.04
      pointer.y += (pointer.ty - pointer.y) * 0.04
      draw(time)
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (!animate || running || !visible || document.hidden) return
      running = true
      last = 0
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    resize()
    draw(0)

    const ro = new ResizeObserver(() => {
      resize()
      if (!running) draw(performance.now())
    })
    ro.observe(wrap)

    const io = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
      if (visible) start()
      else stop()
    })
    io.observe(wrap)

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    if (animate) window.addEventListener('pointermove', onPointer, { passive: true })

    // Re-read colors when the theme class on <html> changes.
    const mo = new MutationObserver(() => {
      colors = readColors()
      if (!running) draw(performance.now())
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    start()

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [pref])

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={cn('relative aspect-square w-full', className)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <span className="eyebrow absolute top-0 left-0">Fig. 01</span>
      <span className="eyebrow absolute right-0 bottom-0">Design → Deploy</span>
    </div>
  )
}
