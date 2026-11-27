/** Route modules, loaded on demand. Shared by the router and hover/focus preloading. */
export const loaders = {
  home: () => import('@/pages/Home'),
  services: () => import('@/pages/Services'),
  service: () => import('@/pages/ServiceDetail'),
  work: () => import('@/pages/Work'),
  project: () => import('@/pages/ProjectDetail'),
  about: () => import('@/pages/About'),
  contact: () => import('@/pages/Contact'),
  notFound: () => import('@/pages/NotFound'),
}
