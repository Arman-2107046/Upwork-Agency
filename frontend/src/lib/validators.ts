import { z } from 'zod'
import { services } from '@/data/services'

/** Keep in sync with ContactMessage::BUDGETS in the backend. */
export const budgetOptions = [
  'Not sure yet',
  'Under $1,000',
  '$1,000 to $5,000',
  '$5,000 to $15,000',
  '$15,000+',
] as const

const serviceSlugs = services.map((s) => s.slug) as [string, ...string[]]

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name so we know who to reply to.').max(120),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address so we can reply.')
    .pipe(z.email('Check the email address. It should look like name@company.com.')),
  company: z.string().trim().max(160).optional(),
  service: z.union([z.enum(serviceSlugs), z.literal('')]),
  budget: z.enum(budgetOptions),
  message: z
    .string()
    .trim()
    .min(20, 'Tell us a little more: at least 20 characters helps us reply usefully.')
    .max(5000),
  /** Honeypot: humans never see or fill it. Checked on submit, not validated. */
  botcheck: z.string().optional(),
})

export type ContactValues = z.infer<typeof contactSchema>
