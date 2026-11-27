import { cn } from '@/lib/cn'

export function Tag({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center border border-line px-3 py-1 font-mono text-label tracking-[0.16em] text-fg/85 uppercase',
        className,
      )}
    >
      {children}
    </span>
  )
}
