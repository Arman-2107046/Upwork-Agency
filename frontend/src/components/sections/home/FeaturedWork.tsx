import { m, useScroll, useTransform } from 'framer-motion'
import { useLayoutEffect, useRef, useState } from 'react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { TextLink } from '@/components/ui/TextLink'
import { sectionIndex } from '@/data/home'
import { featuredProjects } from '@/data/projects'
import { PINNED, useMediaQuery } from '@/hooks/useMediaQuery'
import { useMotionPreference } from '@/motion/useMotionPreference'
import { ProjectCard } from '../ProjectCard'

const heading = (
  <SectionHeader
    id="work-title"
    index={sectionIndex.work}
    eyebrow="Selected work"
    title="Featured projects."
    mutedWords={1}
    intro={
      <TextLink to="/work" arrow>
        See all work
      </TextLink>
    }
  />
)

/** Pinned horizontal gallery: vertical scroll drives the track's x position. */
function PinnedGallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [travel, setTravel] = useState(0)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel])

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => setTravel(Math.max(0, track.scrollWidth - window.innerWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="work-title"
      className="relative isolate border-t border-line"
      style={{ height: `calc(100vh + ${travel}px)` }}
    >
      <div className="sticky top-0 isolate flex h-screen items-center overflow-hidden">
        <m.div
          ref={trackRef}
          style={{ x }}
          className="flex w-max items-center gap-10 pr-[8vw] pl-[max(2rem,calc((100vw-1200px)/2+2rem))]"
        >
          <div className="w-[min(30rem,32vw)] shrink-0">{heading}</div>
          {featuredProjects.map((p, i) => (
            <ProjectCard
              key={p.slug}
              project={p}
              index={i}
              className="w-[min(46rem,52vw)] shrink-0"
            />
          ))}
        </m.div>
      </div>
    </section>
  )
}

/** Swipeable snap carousel (mobile and tablet), or a grid under reduced motion on desktop. */
function SnapGallery() {
  return (
    <section
      aria-labelledby="work-title"
      className="relative isolate overflow-x-clip border-t border-line py-28"
    >
      <div className="container-content relative">{heading}</div>
      <ul
        aria-label="Featured projects"
        className="mt-12 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-4 sm:scroll-px-8 sm:px-8 lg:mx-auto lg:grid lg:max-w-content lg:grid-cols-2 lg:overflow-visible"
      >
        {featuredProjects.map((p, i) => (
          <li key={p.slug} className="w-[85%] shrink-0 snap-start sm:w-[70%] lg:w-auto">
            <ProjectCard project={p} index={i} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function FeaturedWork() {
  const pref = useMotionPreference()
  const pinnable = useMediaQuery(PINNED)
  return pref === 'full' && pinnable ? <PinnedGallery /> : <SnapGallery />
}
