/**
 * Set only when the visitor is signed in to the admin: the server then embeds
 * <script id="staff-content"> (see SpaController::staff). Readers get nothing and no extra request.
 */
export interface Staff {
  /** "edit" for admins and editors, "view" for read-only viewers. */
  access: 'edit' | 'view'
  /** Admin address of a post, with "{slug}" to replace. */
  editUrl: string
}

function read(): Staff | null {
  const text = document.getElementById('staff-content')?.textContent
  if (!text) return null
  try {
    return JSON.parse(text) as Staff
  } catch {
    return null
  }
}

export const staff: Staff | null = read()

export function staffPostUrl(slug: string): string | null {
  return staff ? staff.editUrl.replace('{slug}', encodeURIComponent(slug)) : null
}
