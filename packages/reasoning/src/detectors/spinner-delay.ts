import type { DetectorContext, DetectorResult } from '@w-ux/alignment'

const SPINNER_TIMEOUT_MS = 3000

export function detectSpinnerDelay(ctx: DetectorContext): DetectorResult[] {
  const results: DetectorResult[] = []
  const { events } = ctx
  
  const loadingIndicators = events.filter(e => {
    if (e.modality !== 'dom-snapshot') return false
    const payload = e.payload as Record<string, unknown>
    const elements = payload.elements as Array<Record<string, unknown>> | undefined
    return elements?.some(el => {
      const selector = el.selector as string | undefined
      return selector?.includes('spinner') || 
             selector?.includes('loading') || 
             selector?.includes('skeleton')
    })
  })
  
  for (let i = 0; i < loadingIndicators.length - 1; i++) {
    const current = loadingIndicators[i]
    const next = loadingIndicators[i + 1]
    const duration = next.ts - current.ts
    
    if (duration > SPINNER_TIMEOUT_MS) {
      const interactionsDuring = events.filter(e =>
        e.modality === 'user-interaction' &&
        e.ts > current.ts &&
        e.ts < next.ts
      )
      
      if (interactionsDuring.length > 0) {
        results.push({
          detected: true,
          category: 'spinner-stall',
          confidence: 0.8,
          title: 'Loading spinner blocking interaction',
          description: `Loading indicator persisted for ${duration}ms while user attempted ${interactionsDuring.length} interactions`,
          evidenceIds: [current.id, next.id, ...interactionsDuring.map(e => e.id)],
          metadata: {
            duration,
            interactionCount: interactionsDuring.length,
          },
        })
      }
    }
  }
  
  return results
}