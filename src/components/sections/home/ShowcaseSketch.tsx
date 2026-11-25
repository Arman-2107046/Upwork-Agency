import type { ShowcaseStage } from '@/data/showcase'
import { cn } from '@/lib/cn'

const SHIRT =
  'M38 14 L24 20 L10 34 L18 46 L26 40 L26 92 L74 92 L74 40 L82 46 L90 34 L76 20 L62 14 C60 20 55 24 50 24 C45 24 40 20 38 14 Z'

function Shirt({ className, filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <path
        d={SHIRT}
        fill={filled ? 'color-mix(in srgb, var(--accent) 22%, transparent)' : 'none'}
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M50 24 L50 92"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="2 3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

const Bar = ({ w, accent = false }: { w: string; accent?: boolean }) => (
  <span className={cn('block h-2', accent ? 'bg-accent' : 'bg-line-strong')} style={{ width: w }} />
)

const tones = [
  'var(--graphite-700)',
  'var(--graphite-500)',
  'var(--graphite-300)',
  'var(--graphite-100)',
  'color-mix(in oklab, var(--accent) 70%, var(--ink))',
  'var(--graphite-800)',
]

/** Schematic UI placeholder for each configurator stage (used until screenshots exist). */
export function ShowcaseSketch({ kind }: { kind: ShowcaseStage['sketch'] }) {
  const frame = 'grid h-full w-full gap-5 p-6 sm:p-8'
  switch (kind) {
    case 'fabric':
      return (
        <div className={cn(frame, 'grid-cols-4 content-center')}>
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className={cn(
                'aspect-square border border-line',
                i === 5 && 'ring-2 ring-accent ring-offset-2 ring-offset-surface',
              )}
              style={{ backgroundColor: tones[i % tones.length] }}
            />
          ))}
        </div>
      )
    case 'customize':
      return (
        <div className={cn(frame, 'grid-cols-5 items-center')}>
          <Shirt className="col-span-3 h-full max-h-72 w-full text-fg/60" />
          <div className="col-span-2 flex flex-col gap-4">
            {['60%', '80%', '50%', '70%'].map((w, i) => (
              <div key={i} className={cn('border p-3', i === 1 ? 'border-accent' : 'border-line')}>
                <Bar w={w} accent={i === 1} />
              </div>
            ))}
          </div>
        </div>
      )
    case 'preview':
      return (
        <div className={cn(frame, 'place-items-center')}>
          <div className="relative grid size-full max-h-80 place-items-center">
            <span className="absolute inset-[8%] rounded-full border border-dashed border-line-strong" />
            <Shirt filled className="relative h-4/5 w-4/5 text-fg/70" />
          </div>
        </div>
      )
    case 'pricing':
      return (
        <div className={cn(frame, 'content-center')}>
          {['55%', '40%', '65%', '35%'].map((w, i) => (
            <div key={i} className="flex items-center justify-between border-b border-line pb-4">
              <Bar w={w} />
              <Bar w="14%" />
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <Bar w="30%" accent />
            <span className="block h-3 w-1/5 bg-accent" />
          </div>
        </div>
      )
    case 'order':
      return (
        <div className={cn(frame, 'content-center')}>
          {['70%', '55%', '62%'].map((w, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="grid size-6 place-items-center rounded-full bg-accent">
                <svg viewBox="0 0 16 16" className="size-3.5 text-ink" aria-hidden="true">
                  <path
                    d="M3 8.5 L6.5 12 L13 4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <Bar w={w} />
            </div>
          ))}
          <span className="mt-4 block h-11 w-1/2 border border-accent" />
        </div>
      )
  }
}
