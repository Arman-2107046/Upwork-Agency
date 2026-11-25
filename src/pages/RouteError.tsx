import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { site } from '@/config/site'

/** Last-resort error screen (renders without the layout, so it stays dependency-light). */
export function RouteError() {
  const error = useRouteError()
  const status = isRouteErrorResponse(error) ? error.status : null
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">{site.brandName}</p>
        <h1 className="mt-4 text-display">
          {status === 404 ? 'Page not found' : 'Something went wrong'}
        </h1>
        <p className="mt-4 text-muted">Please reload the page or head back to the homepage.</p>
        <Link to="/" className="btn btn-primary mt-8">
          Go to the homepage
        </Link>
      </div>
    </main>
  )
}
