type ClassValue = string | false | null | undefined | 0

/** Joins truthy class names. Tiny on purpose: no extra dependency needed. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ')
}
