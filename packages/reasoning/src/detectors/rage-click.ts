import type { DetectorContext, DetectorResult, TimelineEvent } from '@w-ux/alignment'

const RAGE_CLICK_THRESHOLD = 3
const RAGE_CLICK_WINDOW_MS = 2000

export function detectRageClick(ctx: DetectorContext): DetectorResult[] {
  const results: DetectorResult[] = []
  const { events, timeline } = ctx
  
  const clickEvents = events.filter(e => 
    e.modality === 'user-interaction' && e.subtype === 'click'
  )
  
  const clicksByElement: Record<string, TimelineEvent[]> = {}
  for (const click of clickEvents) {
    const selector = (click.payload as Record<string, unknown>).selector as string
    if (!selector) continue
    if (!clicksByElement[selector]) clicksByElement[selector] = []
    clicksByElement[selector].push(click)
  }
  
  for (const [selector, clicks] of Object.entries(clicksByElement)) {
    if (clicks.length < RAGE_CLICK_THRESHOLD) continue
    
    clicks.sort((a, b) => a.ts - b.ts)
    
    for (let i = 0; i <= clicks.length - RAGE_CLICK_THRESHOLD; i++) {
      const window = clicks.slice(i, i + RAGE_CLICK_THRESHOLD)
      const timeSpan = window[window.length - 1].ts - window[0].ts
      
      if (timeSpan <= RAGE_CLICK_WINDOW_MS) {
        const domChangesBetween = events.filter(e =>
          e.modality === 'dom-snapshot' &&
          e.ts > window[0].ts &&
          e.ts < window[window.length - 1].ts
        )
        
        if (domChangesBetween.length === 0) {
          results.push({
            detected: true,
            category: 'rage-click',
            confidence: 0.85,
            title: `Rage click detected on ${selector}`,
            description: `User clicked ${window.length} times on the same element within ${timeSpan}ms without any DOM changes between clicks`,
            evidenceIds: window.map(e => e.id),
            metadata: { selector, clickCount: window.length, timeSpan },
          })
        }
      }
    }
  }
  
  return results
}