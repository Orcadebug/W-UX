import type { DetectorContext, DetectorResult } from '@w-ux/alignment'

export function detectLayoutOverlap(ctx: DetectorContext): DetectorResult[] {
  const results: DetectorResult[] = []
  const { events } = ctx
  
  const clickEvents = events.filter(e =>
    e.modality === 'user-interaction' && e.subtype === 'click'
  )
  
  const clsEvents = events.filter(e =>
    e.modality === 'performance' && e.subtype === 'cls'
  )
  
  for (const click of clickEvents) {
    const cssBlockerState = click.cssBlockerState as Record<string, unknown> | undefined
    const overlappingElements = cssBlockerState?.overlappingElements as Array<Record<string, unknown>> | undefined
    
    if (overlappingElements && overlappingElements.length > 0) {
      const recentCLS = clsEvents.find(e =>
        Math.abs(e.ts - click.ts) < 500
      )
      
      const confidence = recentCLS ? 0.85 : 0.75
      
      results.push({
        detected: true,
        category: 'layout-overlap',
        confidence,
        title: 'Layout shift blocking click target',
        description: `Click target has ${overlappingElements.length} overlapping elements${recentCLS ? ' near a layout shift' : ''}`,
        evidenceIds: [click.id, ...(recentCLS ? [recentCLS.id] : [])],
        metadata: {
          overlappingCount: overlappingElements.length,
          overlappingElements: overlappingElements.map(e => ({
            tag: e.tag,
            className: e.className,
          })),
          hadRecentCLS: !!recentCLS,
        },
      })
    }
  }
  
  return results
}