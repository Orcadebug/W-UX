import type { Detector } from './types'
import { detectBlockedCTA } from './blocked-cta'
import { detectRageClick } from './rage-click'
import { detectOverlayInterception } from './overlay-interception'
import { detectDisabledStaleCTA } from './disabled-stale-cta'
import { detectSpinnerDelay } from './spinner-delay'
import { detectLayoutOverlap } from './layout-overlap'

export const DEFAULT_DETECTORS: Detector[] = [
  { name: 'blocked-cta', detect: detectBlockedCTA },
  { name: 'rage-click', detect: detectRageClick },
  { name: 'overlay-interception', detect: detectOverlayInterception },
  { name: 'disabled-stale-cta', detect: detectDisabledStaleCTA },
  { name: 'spinner-delay', detect: detectSpinnerDelay },
  { name: 'layout-overlap', detect: detectLayoutOverlap },
]

export * from './types'
export { detectBlockedCTA } from './blocked-cta'
export { detectRageClick } from './rage-click'
export { detectOverlayInterception } from './overlay-interception'
export { detectDisabledStaleCTA } from './disabled-stale-cta'
export { detectSpinnerDelay } from './spinner-delay'
export { detectLayoutOverlap } from './layout-overlap'