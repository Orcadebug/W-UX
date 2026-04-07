import type { DetectorContext, DetectorResult } from '@w-ux/alignment'

export interface Detector {
  name: string
  detect(ctx: DetectorContext): DetectorResult[]
}