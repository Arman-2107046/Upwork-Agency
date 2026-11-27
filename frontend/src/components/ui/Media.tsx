import type { ImageAsset } from '@/data/types'
import { cn } from '@/lib/cn'

interface MediaProps {
  image: ImageAsset
  className?: string
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean
  sizes?: string
}

/**
 * Renders a real image when `src` is set, otherwise a designed neutral placeholder with the
 * same aspect ratio, so swapping in screenshots later causes no layout change.
 */
export function Media({ image, className, priority = false, sizes = '100vw' }: MediaProps) {
  const ratio = `${image.width} / ${image.height}`
  if (image.src) {
    return (
      <img
        src={image.src}
        srcSet={image.srcSet}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority ? { fetchPriority: 'high' as const } : {})}
        className={cn('h-full w-full object-cover', className)}
        style={{ aspectRatio: ratio }}
      />
    )
  }
  return (
    <div
      role="img"
      aria-label={`${image.alt} (image coming soon)`}
      className={cn(
        'relative flex h-full w-full items-end overflow-hidden bg-surface-2',
        className,
      )}
      style={{ aspectRatio: ratio }}
    >
      <div aria-hidden="true" className="hairline-grid absolute inset-0 opacity-70" />
      <div aria-hidden="true" className="absolute inset-[12%] border border-line-strong/60" />
      <div aria-hidden="true" className="absolute top-[12%] left-[12%] flex gap-1.5 p-3">
        <span className="size-2 bg-line-strong" />
        <span className="size-2 bg-line-strong" />
        <span className="size-2 bg-accent" />
      </div>
      <span
        aria-hidden="true"
        className="relative m-5 font-mono text-label tracking-[0.2em] text-muted uppercase sm:m-6"
      >
        {image.placeholderLabel ?? image.alt}
      </span>
    </div>
  )
}
