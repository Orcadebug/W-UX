import type { Moment, TimelineEvent } from './types'

const GAP_THRESHOLD_MS = 2000
const INTENT_BOUNDARY_THRESHOLD = 3

export function segmentEvents(events: TimelineEvent[]): Moment[] {
  if (events.length === 0) return []
  
  const sorted = [...events].sort((a, b) => a.ts - b.ts)
  const moments: Moment[] = []
  let currentMoment: TimelineEvent[] = []
  let momentId = 0
  
  for (let i = 0; i < sorted.length; i++) {
    const event = sorted[i]
    const prevEvent = sorted[i - 1]
    
    const gap = prevEvent ? event.ts - prevEvent.ts : 0
    const shouldStartNewMoment = 
      gap > GAP_THRESHOLD_MS || 
      (event.modality === 'user-interaction' && currentMoment.length >= INTENT_BOUNDARY_THRESHOLD)
    
    if (shouldStartNewMoment && currentMoment.length > 0) {
      moments.push(createMoment(`moment-${momentId++}`, currentMoment))
      currentMoment = []
    }
    
    currentMoment.push(event)
  }
  
  if (currentMoment.length > 0) {
    moments.push(createMoment(`moment-${momentId}`, currentMoment))
  }
  
  return moments.map(labelMoment)
}

function createMoment(id: string, events: TimelineEvent[]): Moment {
  return {
    id,
    startTs: events[0].ts,
    endTs: events[events.length - 1].ts,
    events,
  }
}

function labelMoment(moment: Moment): Moment {
  const hasNavigation = moment.events.some(e => e.modality === 'network' && e.subtype === 'fetch')
  const hasInteraction = moment.events.some(e => e.modality === 'user-interaction')
  const hasDomChange = moment.events.some(e => e.modality === 'dom-snapshot')
  
  if (hasNavigation && hasInteraction) {
    return { ...moment, label: 'navigation' }
  } else if (hasInteraction) {
    return { ...moment, label: 'interaction' }
  } else if (hasDomChange) {
    return { ...moment, label: 'background-fetch' }
  }
  return { ...moment, label: 'unknown' }
}