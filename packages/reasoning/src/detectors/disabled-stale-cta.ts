import type { DetectorContext, DetectorResult } from '@w-ux/alignment'

export function detectDisabledStaleCTA(ctx: DetectorContext): DetectorResult[] {
  const results: DetectorResult[] = []
  const { events } = ctx
  
  const inputEvents = events.filter(e =>
    e.modality === 'user-interaction' &&
    (e.subtype === 'input' || e.subtype === 'change')
  )
  
  const clickEvents = events.filter(e =>
    e.modality === 'user-interaction' && e.subtype === 'click'
  )
  
  for (const input of inputEvents) {
    const subsequentClicks = clickEvents.filter(c =>
      c.ts > input.ts && c.ts < input.ts + 5000
    )
    
    for (const click of subsequentClicks) {
      const cssBlockerState = click.cssBlockerState as Record<string, unknown> | undefined
      
      if (cssBlockerState?.disabled || cssBlockerState?.ariaDisabled) {
        results.push({
          detected: true,
          category: 'disabled-element',
          confidence: 0.9,
          title: 'Stale disabled CTA after form input',
          description: 'User completed form input but CTA remained disabled',
          evidenceIds: [input.id, click.id],
          metadata: {
            inputSelector: (input.payload as Record<string, unknown>).selector,
            clickSelector: (click.payload as Record<string, unknown>).selector,
            timeGap: click.ts - input.ts,
          },
        })
      }
    }
  }
  
  return results
}