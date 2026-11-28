import { Seo } from '@/components/seo/Seo'
import { ConfiguratorShowcase } from '@/components/sections/home/ConfiguratorShowcase'
import { Deployment } from '@/components/sections/home/Deployment'
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
import { sectionIndex, showDeployment } from '@/data/home'
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
      {showDeployment ? <Deployment /> : null}
      <FeaturedWork />
      <WhyUs />
      <LatestPosts index={sectionIndex.posts} />
      <FinalCta index={posts.length > 0 ? sectionIndex.posts + 1 : sectionIndex.posts} />
    </>
  )
}
