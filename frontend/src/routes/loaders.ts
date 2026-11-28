/** Route modules, loaded on demand. Shared by the router and hover/focus preloading. */
export const loaders = {
  home: () => import('@/pages/Home'),
  services: () => import('@/pages/Services'),
  service: () => import('@/pages/ServiceDetail'),
  work: () => import('@/pages/Work'),
  project: () => import('@/pages/ProjectDetail'),
  blog: () => import('@/pages/Blog'),
  post: () => import('@/pages/BlogPost'),
  about: () => import('@/pages/About'),
  contact: () => import('@/pages/Contact'),
  notFound: () => import('@/pages/NotFound'),
}
