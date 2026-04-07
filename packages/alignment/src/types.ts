import type { TimelineEvent } from '@w-ux/shared-types'

export interface Moment {
  id: string
  startTs: number
  endTs: number
  events: TimelineEvent[]
  label?: string
  correlationGroup?: string
}

export interface AlignedSessionTimeline {
  sessionId: string
  moments: Moment[]
  duration: number
  eventCount: number
}

export interface DetectorContext {
  sessionId: string
  timeline: AlignedSessionTimeline
  events: TimelineEvent[]
}

export interface DetectorResult {
  detected: boolean
  category: string
  confidence: number
  title: string
  description: string
  evidenceIds: string[]
  metadata?: Record<string, unknown>
}