import type { Moment, AlignedSessionTimeline } from '@w-ux/alignment'
import type { SemanticChunk } from '@w-ux/shared-types'
import { summarizeDOMSnapshot } from './dom-summarizer'
import { summarizeEvents, extractUserActions } from './event-summarizer'

export function composeChunks(timeline: AlignedSessionTimeline, sessionId: string): SemanticChunk[] {
  const chunks: SemanticChunk[] = []
  
  for (const moment of timeline.moments) {
    const chunk = composeChunk(moment, sessionId)
    chunks.push(chunk)
  }
  
  return chunks
}

function composeChunk(moment: Moment, sessionId: string): SemanticChunk {
  const modalities = [...new Set(moment.events.map(e => e.modality))]
  const domSnapshots = moment.events.filter(e => e.modality === 'dom-snapshot')
  const interactions = moment.events.filter(e => e.modality === 'user-interaction')
  
  const summaries: string[] = []
  summaries.push(summarizeEvents(moment))
  
  for (const snapshot of domSnapshots.slice(0, 2)) {
    summaries.push(summarizeDOMSnapshot(snapshot))
  }
  
  const actions = extractUserActions(moment)
  if (actions.length > 0) {
    summaries.push(`User actions: ${actions.slice(0, 5).join(', ')}`)
  }
  
  const tokens = generateTokens(moment)
  
  return {
    id: crypto.randomUUID(),
    sessionId,
    startTs: moment.startTs,
    endTs: moment.endTs,
    modalities: modalities as SemanticChunk['modalities'],
    summary: summaries.join('. '),
    tokens,
    evidenceIds: moment.events.map(e => e.id),
  }
}

function generateTokens(moment: Moment): string[] {
  const tokens: string[] = []
  
  if (moment.label) tokens.push(`label:${moment.label}`)
  
  for (const event of moment.events) {
    tokens.push(`${event.modality}:${event.subtype}`)
    
    if (event.modality === 'user-interaction') {
      const payload = event.payload as Record<string, unknown>
      const selector = payload.selector as string
      if (selector) {
        const tag = selector.split(/[.#\[]/)[0]
        tokens.push(`tag:${tag}`)
      }
    }
    
    if (event.correlationIds) {
      tokens.push(`correlated:${event.correlationIds.length}`)
    }
  }
  
  return [...new Set(tokens)]
}