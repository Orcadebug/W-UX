import type { TimelineEvent } from '@w-ux/shared-types'

const CORRELATION_WINDOW_MS = 100

export function linkCorrelations(events: TimelineEvent[]): TimelineEvent[] {
  const sorted = [...events].sort((a, b) => a.ts - b.ts)
  const result: TimelineEvent[] = []
  
  const domSnapshots = sorted.filter(e => e.modality === 'dom-snapshot')
  const interactions = sorted.filter(e => e.modality === 'user-interaction')
  const networkRequests = sorted.filter(e => e.modality === 'network' && !e.payload.status)
  const networkResponses = sorted.filter(e => e.modality === 'network' && e.payload.status)
  const errors = sorted.filter(e => e.modality === 'error')
  
  for (const interaction of interactions) {
    const correlationIds: string[] = []
    
    const nearestDomSnapshot = findNearestNeighbor(interaction, domSnapshots, CORRELATION_WINDOW_MS)
    if (nearestDomSnapshot) correlationIds.push(nearestDomSnapshot.id)
    
    const subsequentRequest = findFirstAfter(interaction, networkRequests, 500)
    if (subsequentRequest) correlationIds.push(subsequentRequest.id)
    
    const subsequentError = findFirstAfter(interaction, errors, 1000)
    if (subsequentError) correlationIds.push(subsequentError.id)
    
    result.push({
      ...interaction,
      correlationIds: correlationIds.length > 0 ? correlationIds : undefined
    })
  }
  
  for (const request of networkRequests) {
    const correlationIds: string[] = []
    const matchingResponse = networkResponses.find(r => 
      r.payload.url === request.payload.url && r.ts > request.ts
    )
    if (matchingResponse) correlationIds.push(matchingResponse.id)
    
    result.push({
      ...request,
      correlationIds: correlationIds.length > 0 ? correlationIds : undefined
    })
  }
  
  const processedIds = new Set(result.map(e => e.id))
  for (const event of sorted) {
    if (!processedIds.has(event.id)) {
      result.push(event)
    }
  }
  
  return result.sort((a, b) => a.ts - b.ts)
}

function findNearestNeighbor(target: TimelineEvent, candidates: TimelineEvent[], windowMs: number): TimelineEvent | null {
  let nearest: TimelineEvent | null = null
  let minDiff = windowMs
  
  for (const candidate of candidates) {
    const diff = Math.abs(candidate.ts - target.ts)
    if (diff < minDiff) {
      minDiff = diff
      nearest = candidate
    }
  }
  
  return nearest
}

function findFirstAfter(target: TimelineEvent, candidates: TimelineEvent[], maxDelay: number): TimelineEvent | null {
  const sorted = candidates.filter(c => c.ts > target.ts && c.ts - target.ts <= maxDelay)
  return sorted.sort((a, b) => a.ts - b.ts)[0] || null
}