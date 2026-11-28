import { loaders } from './loaders'

const done = new Set<string>()

/** Starts downloading a route's chunk ahead of navigation (on hover or focus of a link). */
export function preloadRoute(to: string): void {
  const path = to.split(/[?#]/)[0] ?? '/'
  let key: keyof typeof loaders | null = null
  if (path === '/') key = 'home'
  else if (path === '/services') key = 'services'
  else if (path.startsWith('/services/')) key = 'service'
  else if (path === '/work') key = 'work'
  else if (path.startsWith('/work/')) key = 'project'
  else if (path === '/blog') key = 'blog'
  else if (path.startsWith('/blog/')) key = 'post'
  else if (path === '/about') key = 'about'
  else if (path === '/contact') key = 'contact'
  if (!key || done.has(key)) return
  done.add(key)
  void loaders[key]()
}
