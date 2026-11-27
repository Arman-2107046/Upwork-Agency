import type { SiteContent } from './types'

/**
 * Loads the CMS content once, before any page module runs.
 *
 * In production Laravel embeds it in the HTML (<script id="site-content">), so this is
 * synchronous and pages render with no loading state. Under the Vite dev server it is fetched
 * from /api/content (proxied to the backend, see vite.config.ts). Modules that import this
 * one wait for the top-level await, so `getContent()` is always ready when they run.
 */
async function load(): Promise<SiteContent> {
  const inline = document.getElementById('site-content')?.textContent
  if (inline) return JSON.parse(inline) as SiteContent

  const res = await fetch('/api/content', { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`GET /api/content responded with ${res.status}`)
  return (await res.json()) as SiteContent
}

function renderFailure(error: unknown): void {
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML = `<main style="padding:48px 24px;font-family:system-ui,sans-serif;max-width:40rem">
    <h1 style="font-size:1.5rem">The website content could not be loaded.</h1>
    <p>Please reload the page in a moment.</p>
    ${import.meta.env.DEV ? `<pre style="white-space:pre-wrap;color:#b00">${String(error)}\n\nIs the backend running? See README.md, "Local development".</pre>` : ''}
  </main>`
}

let content: SiteContent
try {
  content = await load()
} catch (error) {
  renderFailure(error)
  throw error
}

export function getContent(): SiteContent {
  return content
}
