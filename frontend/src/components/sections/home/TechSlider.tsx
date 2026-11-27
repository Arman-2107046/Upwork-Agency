import { Pause, Play } from 'lucide-react'
import { useState } from 'react'
import { IndexLabel } from '@/components/ui/SectionHeader'
import { TechLogo } from '@/components/ui/TechLogo'
import { sliderRows } from '@/data/technologies'
import { cn } from '@/lib/cn'
import { Reveal } from '@/motion/Reveal'
import { useMotionPreference } from '@/motion/useMotionPreference'

function Tile({ name }: { name: string }) {
  return (
    <div className="group/tile relative flex h-28 w-36 shrink-0 flex-col items-center justify-center gap-3 border border-line bg-surface transition-colors duration-[var(--dur-micro)] hover:border-fg sm:h-32 sm:w-40">
      <TechLogo name={name} size={34} />
      <span className="px-2 text-center font-mono text-[0.625rem] leading-tight tracking-[0.18em] text-fg/80 uppercase">
        {name}
      </span>
      <span
        aria-hidden="true"
        className="absolute bottom-2.5 left-1/2 h-px w-4 -translate-x-1/2 bg-accent transition-[width] duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover/tile:w-10"
      />
    </div>
  )
}

/**
 * "What we build with": rows of logo tiles that drift in alternating directions
 * (CSS transform keyframes, compositor only). One control pauses every row; hover and
 * focus pause too. Under reduced motion the rows render as static wrapped grids.
 */
export function TechSlider() {
  const pref = useMotionPreference()
  const [paused, setPaused] = useState(false)
  const animate = pref === 'full'

  return (
    <section aria-labelledby="stack-title" className="relative border-b border-line py-20 sm:py-24">
      <div className="container-content flex items-center justify-between gap-6">
        <h2 id="stack-title">
          <Reveal as="span" distance={12} className="block">
            <IndexLabel>What we build with</IndexLabel>
          </Reveal>
        </h2>
        {animate ? (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            aria-label={paused ? 'Play technology slider' : 'Pause technology slider'}
            className="icon-btn"
          >
            {paused ? (
              <Play size={14} aria-hidden="true" />
            ) : (
              <Pause size={14} aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>

      <div className="marquee mt-10 flex flex-col gap-4" data-paused={paused}>
        {sliderRows.map((row, i) => (
          <div
            key={row.label}
            className="container-content grid items-center gap-4 lg:grid-cols-12 lg:gap-8"
          >
            <h3 className="eyebrow !font-mono lg:col-span-3">{row.label}</h3>
            {animate ? (
              <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] lg:col-span-9">
                <div
                  className={cn(
                    'marquee-track flex w-max',
                    i % 2 === 1 && '[animation-direction:reverse]',
                  )}
                  style={{ animationDuration: `calc(var(--dur-marquee) * ${1 + i * 0.15})` }}
                >
                  <ul aria-label={row.label} className="flex shrink-0 gap-3 pr-3">
                    {row.items.map((item) => (
                      <li key={item}>
                        <Tile name={item} />
                      </li>
                    ))}
                  </ul>
                  <ul aria-hidden="true" className="flex shrink-0 gap-3 pr-3">
                    {row.items.map((item) => (
                      <li key={item}>
                        <Tile name={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <ul aria-label={row.label} className="flex flex-wrap gap-3 lg:col-span-9">
                {row.items.map((item) => (
                  <li key={item}>
                    <Tile name={item} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
