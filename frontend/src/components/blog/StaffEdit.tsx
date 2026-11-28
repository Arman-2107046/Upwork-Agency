import { ArrowUpRight, Eye, Pencil } from 'lucide-react'
import { staff, staffPostUrl } from '@/data/staff'
import { cn } from '@/lib/cn'

/** "Edit post" under the title, for team members signed in to the admin. Readers see nothing. */
export function StaffEditButton({ slug, className }: { slug: string; className?: string }) {
  const url = staffPostUrl(slug)
  if (!staff || !url) return null
  const edit = staff.access === 'edit'
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener"
      className={cn(
        'inline-flex min-h-9 items-center gap-2 border border-line-strong px-3 font-mono text-label tracking-[0.16em] text-fg/80 uppercase transition-colors duration-[var(--dur-micro)] hover:border-fg hover:text-fg',
        className,
      )}
    >
      {edit ? <Pencil size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
      {edit ? 'Edit post' : 'Open in admin'}
      <ArrowUpRight size={14} aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

/** Pencil in a card's cover corner: on hover or focus, always on touch screens. */
export function StaffEditPencil({ slug, title }: { slug: string; title: string }) {
  const url = staffPostUrl(slug)
  if (!staff || !url) return null
  const edit = staff.access === 'edit'
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener"
      aria-label={`${edit ? 'Edit' : 'Open in admin'}: ${title} (opens in a new tab)`}
      title={edit ? 'Edit post' : 'Open in admin'}
      className="absolute top-3 right-3 z-10 grid size-10 place-items-center border border-line bg-bg text-fg opacity-100 transition-opacity duration-[var(--dur-micro)] hover:border-fg focus-visible:opacity-100 pointer-fine:opacity-0 pointer-fine:group-hover/card:opacity-100"
    >
      {edit ? <Pencil size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
    </a>
  )
}
