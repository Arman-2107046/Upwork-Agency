/** Reader actions on a blog post. Pages stay identical for everyone; these go from the browser. */

export interface Engagement {
  views: number
  likes: number
  liked: boolean
  comments: number
}

export class RateLimitedError extends Error {}
export class OfflineError extends Error {}
export class ValidationError extends Error {
  constructor(public fields: Record<string, string[]>) {
    super('Validation failed')
  }
}

async function post(path: string, body?: unknown): Promise<Response> {
  let res: Response
  try {
    res = await fetch(path, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new OfflineError()
  }
  if (res.status === 429) throw new RateLimitedError()
  if (res.status === 422) {
    const data = (await res.json().catch(() => ({}))) as { errors?: Record<string, string[]> }
    throw new ValidationError(data.errors ?? {})
  }
  if (!res.ok) throw new Error(`POST ${path} responded with ${res.status}`)
  return res
}

const base = (slug: string) => `/api/posts/${encodeURIComponent(slug)}`

/** Counts one view and returns the live likes, this reader's like and the comment count. */
export async function recordView(slug: string): Promise<Engagement> {
  return (await (await post(`${base(slug)}/view`)).json()) as Engagement
}

export async function toggleLike(slug: string): Promise<{ liked: boolean; likes: number }> {
  return (await (await post(`${base(slug)}/like`)).json()) as { liked: boolean; likes: number }
}

export async function sendComment(
  slug: string,
  values: { name: string; email: string; body: string; website?: string },
): Promise<void> {
  await post(`${base(slug)}/comments`, values)
}
