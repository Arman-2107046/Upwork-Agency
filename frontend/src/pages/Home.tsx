import { Seo } from '@/components/seo/Seo'
import { ConfiguratorShowcase } from '@/components/sections/home/ConfiguratorShowcase'
import { FeaturedWork } from '@/components/sections/home/FeaturedWork'
import { FinalCta } from '@/components/sections/home/FinalCta'
import { Hero } from '@/components/sections/home/Hero'
import { LatestPosts } from '@/components/sections/home/LatestPosts'
import { Process } from '@/components/sections/home/Process'
import { ServicesGrid } from '@/components/sections/home/ServicesGrid'
import { Statement } from '@/components/sections/home/Statement'
import { TechSlider } from '@/components/sections/home/TechSlider'
import { Technologies } from '@/components/sections/home/Technologies'
import { WhyUs } from '@/components/sections/home/WhyUs'
import { pageSeo } from '@/data/pages'
import { posts } from '@/data/posts'

export default function Home() {
  return (
    <>
      <Seo title={pageSeo.home.title} description={pageSeo.home.description} path="/" />
      <Hero />
      <TechSlider />
      <Statement />
      <ServicesGrid />
      <ConfiguratorShowcase />
      <Process />
      <Technologies />
      <FeaturedWork />
      <WhyUs />
      <LatestPosts index={8} />
      <FinalCta index={posts.length > 0 ? 9 : 8} />
    </>
  )
}
