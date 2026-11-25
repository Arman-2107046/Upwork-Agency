import { Seo } from '@/components/seo/Seo'
import { ConfiguratorShowcase } from '@/components/sections/home/ConfiguratorShowcase'
import { FeaturedWork } from '@/components/sections/home/FeaturedWork'
import { FinalCta } from '@/components/sections/home/FinalCta'
import { Hero } from '@/components/sections/home/Hero'
import { Process } from '@/components/sections/home/Process'
import { ServicesGrid } from '@/components/sections/home/ServicesGrid'
import { Statement } from '@/components/sections/home/Statement'
import { TechSlider } from '@/components/sections/home/TechSlider'
import { Technologies } from '@/components/sections/home/Technologies'
import { WhyUs } from '@/components/sections/home/WhyUs'
import { site } from '@/config/site'

export default function Home() {
  return (
    <>
      <Seo
        title={`${site.brandName} | Web, E-commerce & AI Automation`}
        description="Websites, e-commerce, product configurators, SaaS, AI chatbots and workflow automation, designed and built end to end."
        path="/"
      />
      <Hero />
      <TechSlider />
      <Statement />
      <ServicesGrid />
      <ConfiguratorShowcase />
      <Process />
      <Technologies />
      <FeaturedWork />
      <WhyUs />
      <FinalCta />
    </>
  )
}
