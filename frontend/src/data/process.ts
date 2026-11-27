import { getContent } from '@/content/load'
import type { TitledText } from '@/content/types'

export type ProcessStep = TitledText

/** Process steps (Pages > Home page > Process). */
export const processSteps: ProcessStep[] = getContent().home.processSteps
