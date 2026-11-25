import { site } from '@/config/site'

interface WhyItem {
  text: string
  /** Hidden when the matching claim is disabled in src/config/site.ts. */
  claim?: keyof typeof site.claims
}

const items: WhyItem[] = [
  { text: 'Established Upwork agency with extensive project experience', claim: 'upworkBadge' },
  { text: 'Specialized expertise in fashion e-commerce and customization' },
  { text: 'Complete solutions from design and database to deployment' },
  { text: 'AI chatbot and automation expertise' },
  { text: 'Ongoing maintenance and technical support' },
]

export const whyItems: string[] = items
  .filter((item) => !item.claim || Boolean(site.claims[item.claim]))
  .map((item) => item.text)
