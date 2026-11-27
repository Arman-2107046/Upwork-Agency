import { useMediaQuery } from '@/hooks/useMediaQuery'

export type MotionPreference = 'full' | 'reduced'

const REDUCED = '(prefers-reduced-motion: reduce)'

/**
 * The single source of truth for motion preference. Every primitive reads it, and it follows
 * the OS "reduce motion" setting live (no reload needed).
 */
export function useMotionPreference(): MotionPreference {
  return useMediaQuery(REDUCED) ? 'reduced' : 'full'
}
