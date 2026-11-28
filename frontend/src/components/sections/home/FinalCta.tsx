import { ButtonAnchor, ButtonLink } from '@/components/ui/Button'
import { IndexLabel } from '@/components/ui/SectionHeader'
import { site } from '@/config/site'
import { finalCta } from '@/data/home'
import { Magnetic } from '@/motion/Magnetic'
import { Parallax } from '@/motion/Parallax'
import { Reveal } from '@/motion/Reveal'
import { SplitText } from '@/motion/SplitText'
import { sequence } from '@/motion/tokens'

/** Closing call to action: centered display heading over a horizon arc. */
export function FinalCta({ index = 8 }: { index?: number }) {
  return (
    <section
      aria-labelledby="cta-title"
      className="relative isolate overflow-hidden border-t border-line pt-32 sm:pt-40"
    >
      <div className="container-content relative text-center">
        <Reveal as="p" distance={12}>
          <IndexLabel index={index}>Next step</IndexLabel>
        </Reveal>
        <SplitText
          as="h2"
          id="cta-title"
          text="Tell us what you're building."
          mutedWords={2}
          className="mx-auto mt-6 max-w-4xl text-hero"
        />
        <Reveal delay={sequence.follow} className="mx-auto mt-8 max-w-xl text-lead text-muted">
          <p>{finalCta}</p>
        </Reveal>
        <Reveal
          delay={sequence.follow + 0.1}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Magnetic>
            <ButtonLink to="/contact" arrow>
              Start a project
            </ButtonLink>
          </Magnetic>
          {site.email ? (
            <ButtonAnchor href={`mailto:${site.email}`} variant="secondary" newTab={false}>
              Email us
            </ButtonAnchor>
          ) : null}
        </Reveal>
        <Reveal delay={sequence.follow + 0.2}>
          <p className="eyebrow mt-8">We reply {site.responseTime}</p>
        </Reveal>
      </div>

      {/* Horizon: an accent arc rising from below, with a soft glow above its rim */}
      <div aria-hidden="true" className="relative mt-20 h-40 sm:mt-24 sm:h-56">
        <Parallax speed={-0.1} className="absolute inset-0">
          <svg
            className="absolute top-0 left-1/2 h-[28rem] w-full min-w-[64rem] -translate-x-1/2"
            viewBox="0 0 1600 560"
            preserveAspectRatio="xMidYMin slice"
            focusable="false"
          >
            <defs>
              <radialGradient id="cta-glow" cx="50%" cy="0%" r="70%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.32" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="800" cy="1000" rx="1080" ry="1000" fill="url(#cta-glow)" />
            <ellipse cx="800" cy="1000" rx="980" ry="940" fill="var(--bg)" />
            <ellipse
              cx="800"
              cy="1000"
              rx="980"
              ry="940"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.25"
            />
          </svg>
        </Parallax>
      </div>
    </section>
  )
}
