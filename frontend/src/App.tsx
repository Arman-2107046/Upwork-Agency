import { lazy, type ComponentType } from 'react'
import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { RouteError } from '@/pages/RouteError'
import { loaders } from '@/routes/loaders'

const page = (load: () => Promise<{ default: ComponentType }>) => {
  const Component = lazy(load)
  return <Component />
}

const routes: RouteObject[] = [
  { index: true, element: page(loaders.home) },
  { path: 'services', element: page(loaders.services) },
  { path: 'services/:slug', element: page(loaders.service) },
  { path: 'work', element: page(loaders.work) },
  { path: 'work/:slug', element: page(loaders.project) },
  { path: 'blog', element: page(loaders.blog) },
  { path: 'blog/:slug', element: page(loaders.post) },
  { path: 'about', element: page(loaders.about) },
  { path: 'contact', element: page(loaders.contact) },
]

// Dev-only playground. `import.meta.env.DEV` is false in production builds, so this
// branch and the MotionLab module are removed entirely.
if (import.meta.env.DEV) {
  routes.push({ path: 'motion-lab', element: page(() => import('@/pages/MotionLab')) })
}

routes.push({ path: '*', element: page(loaders.notFound) })

const router = createBrowserRouter(
  [{ element: <RootLayout />, errorElement: <RouteError />, children: routes }],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  },
)

export function App() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />
}
