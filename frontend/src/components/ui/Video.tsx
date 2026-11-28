import type { VideoAsset } from '@/data/types'
import { cn } from '@/lib/cn'

/** Plays a project video uploaded in the admin. Never autoplays. */
export function Video({ video, className }: { video: VideoAsset; className?: string }) {
  const style = { aspectRatio: `${video.width} / ${video.height}` }

  return (
    <video
      src={video.src}
      poster={video.poster}
      controls
      playsInline
      preload="metadata"
      aria-label={video.title}
      className={cn('block h-auto w-full bg-black object-contain', className)}
      style={style}
    />
  )
}
