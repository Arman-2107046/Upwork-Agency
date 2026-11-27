import type { VideoAsset } from '@/data/types'
import { cn } from '@/lib/cn'

/**
 * Plays a project video: the Cloudflare Stream player (adaptive quality) once the upload is
 * processed, otherwise the file from the server. Never autoplays.
 */
export function Video({ video, className }: { video: VideoAsset; className?: string }) {
  const style = { aspectRatio: `${video.width} / ${video.height}` }

  if (video.provider === 'stream') {
    const src = new URL(video.src)
    if (video.poster) src.searchParams.set('poster', video.poster)
    return (
      <iframe
        src={src.toString()}
        title={video.title}
        loading="lazy"
        allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className={cn('block h-auto w-full border-0', className)}
        style={style}
      />
    )
  }

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
