import { useEffect, useState } from 'react'
import { recordView, type Engagement } from '@/lib/blogApi'

// One view per page load, even when React mounts an effect twice in development.
const counted = new Map<string, Promise<Engagement>>()

/** Live counts for a post, fetched once per page load (the page itself is the same for everyone). */
export function useEngagement(slug: string, enabled: boolean) {
  const [state, setState] = useState<Engagement | null>(null)

  useEffect(() => {
    if (!enabled) return
    let active = true
    let request = counted.get(slug)
    if (!request) {
      request = recordView(slug)
      counted.set(slug, request)
      // Navigating back to the post later is another view.
      window.setTimeout(() => counted.delete(slug), 2000)
    }
    request.then((e) => active && setState(e)).catch(() => undefined)
    return () => {
      active = false
    }
  }, [slug, enabled])

  return [state, setState] as const
}
