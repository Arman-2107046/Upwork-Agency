import { Seo } from '@/components/seo/Seo'
import { HeroGrid } from '@/components/sections/HeroGrid'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/motion/Reveal'
import { SplitText } from '@/motion/SplitText'
import { sequence } from '@/motion/tokens'

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page not found"
        description="The page you are looking for does not exist or has moved."
        path="/404"
        noindex
      />
      <section className="relative grid min-h-[100svh] place-items-center overflow-hidden">
        <HeroGrid />
        <div className="container-content relative py-32 text-center">
          <p
            aria-hidden="true"
            className="text-outline font-display text-[clamp(7rem,22vw,16rem)] leading-none font-bold"
          >
            404
          </p>
          <SplitText
            as="h1"
            onMount
            text="This page doesn't exist."
            mutedWords={1}
            className="mt-4 text-display"
          />
          <Reveal onMount delay={sequence.pageIntro} className="mt-6">
            <p className="text-muted">The link may be broken, or the page may have moved.</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <ButtonLink to="/" arrow>
                Back to the homepage
              </ButtonLink>
              <ButtonLink to="/contact" variant="secondary">
                Contact us
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
