import {
  Bot,
  Cloud,
  Database,
  LayoutDashboard,
  Monitor,
  Palette,
  PenTool,
  ShoppingBag,
  Workflow,
  type LucideProps,
} from 'lucide-react'
import type { ServiceIconName } from '@/data/services'

const icons = {
  'shopping-bag': ShoppingBag,
  'layout-dashboard': LayoutDashboard,
  monitor: Monitor,
  bot: Bot,
  workflow: Workflow,
  database: Database,
  cloud: Cloud,
  palette: Palette,
  'pen-tool': PenTool,
} satisfies Record<ServiceIconName, unknown>

export function ServiceIcon({ name, ...props }: { name: ServiceIconName } & LucideProps) {
  const Icon = icons[name]
  return <Icon aria-hidden="true" strokeWidth={1.5} {...props} />
}
