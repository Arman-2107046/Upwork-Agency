/** Static production routes. Service and project pages are added from src/data at build time. */
export const staticRoutes = ['/', '/services', '/work', '/about', '/contact'] as const

export const navItems = [
  { label: 'Services', to: '/services' },
  { label: 'Work', to: '/work' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
] as const
