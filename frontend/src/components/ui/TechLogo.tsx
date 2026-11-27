import {
  GitMerge,
  Image as ImageIcon,
  PenTool,
  Plug,
  Search,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { brandIcons } from '@/data/brandIcons'
import { cn } from '@/lib/cn'

/** Brand marks live in src/data/brandIcons.ts (simple-icons, CC0). Generic entries use a line icon. */
const generic: Record<string, LucideIcon> = {
  'LLM APIs': Sparkles,
  'CI/CD': GitMerge,
  APIs: Plug,
  SEO: Search,
  Photoshop: ImageIcon,
  Illustrator: PenTool,
}

/** Near-black brand colors disappear on the dark theme; those use the text color instead. */
function isDark(hex: string): boolean {
  const n = parseInt(hex, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 40
}

/** Decorative logo for a technology name. Renders nothing for unknown names. */
export function TechLogo({
  name,
  size = 32,
  className,
  mono = false,
}: {
  name: string
  size?: number
  className?: string
  /** Draw in the current text color instead of the brand color. */
  mono?: boolean
}) {
  const brand = brandIcons[name]
  if (brand) {
    const fill = mono || isDark(brand.hex) ? 'currentColor' : `#${brand.hex}`
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        aria-hidden="true"
        focusable="false"
        className={cn('shrink-0', className)}
      >
        <path d={brand.path} fill={fill} />
      </svg>
    )
  }
  const Icon = generic[name]
  return Icon ? (
    <Icon
      size={size}
      strokeWidth={1.5}
      aria-hidden="true"
      className={cn('shrink-0 text-accent-ink', className)}
    />
  ) : null
}
