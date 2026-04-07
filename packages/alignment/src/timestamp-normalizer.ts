import type { TimelineEvent } from '@w-ux/shared-types'

export function normalizeTimestamps(events: TimelineEvent[], sessionStartedAt: number, firstNetworkDate?: Date): TimelineEvent[] {
  let anchor = sessionStartedAt
  if (firstNetworkDate) {
    const serverTs = firstNetworkDate.getTime()
    const clientTs = events.find(e => e.modality === 'network')?.ts || sessionStartedAt
    const drift = serverTs - clientTs
    anchor = sessionStartedAt + drift
  }
  return events.map(event => ({
    ...event,
    ts: event.ts - anchor
  }))
}