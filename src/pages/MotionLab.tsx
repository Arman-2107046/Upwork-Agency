/**
 * Dev-only playground for every motion primitive. Registered only when
 * import.meta.env.DEV is true, so it never ships in production builds or the sitemap.
 */
import type { ReactNode } from 'react'
import { Seo } from '@/components/seo/Seo'
import { PageHero } from '@/components/sections/PageHero'
import { ButtonLink } from '@/components/ui/Button'
import { Media } from '@/components/ui/Media'
import { allTechnologies } from '@/data/technologies'
import { CountUp } from '@/motion/CountUp'
import { ImageReveal } from '@/motion/ImageReveal'
import { Magnetic } from '@/motion/Magnetic'
import { Marquee } from '@/motion/Marquee'
import { Parallax } from '@/motion/Parallax'
import { Reveal } from '@/motion/Reveal'
import { SplitText } from '@/motion/SplitText'
import { SpotlightCard } from '@/motion/SpotlightCard'
import { Stagger, StaggerItem } from '@/motion/Stagger'
import { TextScrollFill } from '@/motion/TextScrollFill'
import { useMotionPreference } from '@/motion/useMotionPreference'

function Demo({ name, note, children }: { name: string; note: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`lab-${name}`} className="border-t border-line py-16">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
        <h2 id={`lab-${name}`} className="font-mono text-lg">
          &lt;{name} /&gt;
        </h2>
        <p className="text-sm text-muted">{note}</p>
      </div>
      {children}
    </section>
  )
}

export default function MotionLab() {
  const pref = useMotionPreference()
  return (
    <>
      <Seo
        title="Motion lab"
        description="Development playground for motion primitives."
        path="/motion-lab"
        noindex
      />
      <PageHero
        eyebrow="Development only"
        title="Motion lab."
        intro={`Every primitive in src/motion. Current preference: ${pref}. Toggle your OS "reduce motion" setting to compare.`}
      />
      <div className="container-content pb-32">
        <Demo name="Reveal" note="direction up / down / left / right">
          <div className="grid gap-4 sm:grid-cols-4">
            {(['up', 'down', 'left', 'right'] as const).map((d) => (
              <Reveal
                key={d}
                direction={d}
                className="border border-line bg-surface p-6 text-center"
              >
                {d}
              </Reveal>
            ))}
          </div>
        </Demo>

        <Demo name="SplitText" note="words (default) and lines">
          <SplitText text="Words slide up from behind a mask." className="text-display" />
          <SplitText
            as="p"
            by="line"
            text={'Lines can be split too,\nusing a line break in the text.'}
            className="mt-6 text-title"
          />
        </Demo>

        <Demo name="Stagger" note="parent sequences StaggerItem children">
          <Stagger as="ul" className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            {Array.from({ length: 6 }, (_, i) => (
              <StaggerItem
                as="li"
                key={i}
                className="border border-line bg-surface p-6 text-center"
              >
                {i + 1}
              </StaggerItem>
            ))}
          </Stagger>
        </Demo>

        <Demo name="Parallax" note="speed -0.3 to 0.3">
          <div className="grid grid-cols-3 gap-4">
            {[-0.3, 0, 0.3].map((speed) => (
              <Parallax
                key={speed}
                speed={speed}
                className="border border-line bg-surface p-10 text-center"
              >
                {speed}
              </Parallax>
            ))}
          </div>
        </Demo>

        <Demo name="ImageReveal" note="clip-path from the bottom, inner scale 1.15 to 1">
          <ImageReveal className="max-w-2xl border border-line">
            <Media
              image={{
                alt: 'Placeholder image',
                width: 1600,
                height: 900,
                placeholderLabel: 'Image placeholder',
              }}
            />
          </ImageReveal>
        </Demo>

        <Demo name="Magnetic" note="desktop pointer only, 12px radius">
          <Magnetic>
            <ButtonLink to="/contact" arrow>
              Hover me
            </ButtonLink>
          </Magnetic>
        </Demo>

        <Demo name="Marquee" note="pauses on hover, focus and via the button">
          <Marquee items={allTechnologies} label="Technologies" />
        </Demo>

        <Demo name="CountUp" note="factual numbers only">
          <p className="font-display text-display font-semibold">
            <CountUp value={8} pad={2} /> services, <CountUp value={5} pad={2} /> steps
          </p>
        </Demo>

        <Demo name="ScrollProgress" note="see the 2px accent bar under the header">
          <p className="text-muted">It is mounted globally in the header.</p>
        </Demo>

        <Demo name="PageTransition" note="navigate between pages">
          <ButtonLink to="/about" variant="secondary">
            Go to About
          </ButtonLink>
        </Demo>

        <Demo name="TextScrollFill" note="words go from 30% to 100% opacity with scroll">
          <TextScrollFill
            text="Scroll slowly through this paragraph and watch each word fill in as it passes the reading line on your screen."
            className="font-display text-statement"
          />
        </Demo>

        <Demo name="SpotlightCard" note="pointer highlight + 4deg tilt; lift on touch">
          <div className="grid gap-4 sm:grid-cols-3">
            {['One', 'Two', 'Three'].map((t) => (
              <SpotlightCard key={t} className="p-10">
                <p className="text-title">{t}</p>
              </SpotlightCard>
            ))}
          </div>
        </Demo>
      </div>
    </>
  )
}
