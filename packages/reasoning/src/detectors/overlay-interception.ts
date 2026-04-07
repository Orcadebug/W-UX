import type { DetectorContext, DetectorResult } from '@w-ux/alignment'

export function detectOverlayInterception(ctx: DetectorContext): DetectorResult[] {
  const results: DetectorResult[] = []
  const { events } = ctx
  
  const clickEvents = events.filter(e => 
    e.modality === 'user-interaction' && e.subtype === 'click'
  )
  
  for (const click of clickEvents) {
    const payload = click.payload as Record<string, unknown>
    
    if (payload.elementFromPointMismatch) {
      const interceptorTag = payload.elementAtPointTag as string
      const targetTag = payload.tagName as string
      
      let interceptorType = 'unknown'
      if (['dialog', 'modal', 'popup'].some(t => interceptorTag?.includes(t))) {
        interceptorType = 'modal'
      } else if (['banner', 'toast', 'notification'].some(t => interceptorTag?.includes(t))) {
        interceptorType = 'banner'
      } else if (interceptorTag === 'div') {
        interceptorType = 'overlay'
      }
      
      results.push({
        detected: true,
        category: 'layout-overlap',
        confidence: 0.9,
        title: `Overlay interception: ${interceptorType}`,
        description: `User clicked on ${targetTag} but ${interceptorTag} intercepted the click`,
        evidenceIds: [click.id],
        metadata: {
          targetSelector: payload.selector,
          targetTag,
          interceptorTag,
          interceptorType,
          interceptorSelector: payload.elementAtPointSelector,
        },
      })
    }
  }
  
  return results
}