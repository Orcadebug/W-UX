import type { DetectorContext, DetectorResult, TimelineEvent } from '@w-ux/alignment'
import type { CSSBlockerState } from '@w-ux/shared-types'

const CLICK_WINDOW_MS = 2000
const MIN_CLICKS = 2

export function detectBlockedCTA(ctx: DetectorContext): DetectorResult[] {
  const results: DetectorResult[] = []
  const { events } = ctx
  
  const clickEvents = events.filter(e => 
    e.modality === 'user-interaction' && 
    (e.subtype === 'click' || e.subtype === 'pointerdown')
  )
  
  const clickGroups: TimelineEvent[][] = []
  let currentGroup: TimelineEvent[] = []
  
  for (let i = 0; i < clickEvents.length; i++) {
    if (currentGroup.length === 0 || 
        clickEvents[i].ts - currentGroup[currentGroup.length - 1].ts < CLICK_WINDOW_MS) {
      currentGroup.push(clickEvents[i])
    } else {
      if (currentGroup.length >= MIN_CLICKS) clickGroups.push([...currentGroup])
      currentGroup = [clickEvents[i]]
    }
  }
  if (currentGroup.length >= MIN_CLICKS) clickGroups.push(currentGroup)
  
  for (const group of clickGroups) {
    const firstClick = group[0]
    const payload = firstClick.payload as Record<string, unknown>
    const cssBlockerState = firstClick.cssBlockerState as CSSBlockerState | undefined
    
    let detected = false
    let confidence = 0
    const blockingReasons: string[] = []
    
    if (payload.elementFromPointMismatch) {
      detected = true
      confidence = Math.max(confidence, 0.9)
      blockingReasons.push('elementFromPoint mismatch - overlay blocking click')
    }
    
    if (cssBlockerState) {
      if (cssBlockerState.pointerEvents === 'none') {
        detected = true
        confidence = Math.max(confidence, 0.95)
        blockingReasons.push('pointer-events: none')
      }
      if (cssBlockerState.disabled) {
        detected = true
        confidence = Math.max(confidence, 0.99)
        blockingReasons.push('element disabled')
      }
      if (cssBlockerState.ariaDisabled) {
        detected = true
        confidence = Math.max(confidence, 0.98)
        blockingReasons.push('aria-disabled: true')
      }
      if (cssBlockerState.opacity === 0) {
        detected = true
        confidence = Math.max(confidence, 0.95)
        blockingReasons.push('opacity: 0')
      }
      if (cssBlockerState.visibility === 'hidden') {
        detected = true
        confidence = Math.max(confidence, 0.95)
        blockingReasons.push('visibility: hidden')
      }
      if (cssBlockerState.isOffscreen) {
        detected = true
        confidence = Math.max(confidence, 0.85)
        blockingReasons.push('element offscreen')
      }
      if (cssBlockerState.overlappingElements && cssBlockerState.overlappingElements.length > 0) {
        detected = true
        confidence = Math.max(confidence, 0.9)
        blockingReasons.push(`${cssBlockerState.overlappingElements.length} overlapping elements with higher z-index`)
      }
    }
    
    const pendingNetworkRequests = events.filter(e => 
      e.modality === 'network' &&
      e.ts > firstClick.ts &&
      e.ts < firstClick.ts + CLICK_WINDOW_MS &&
      !e.payload.status
    )
    if (pendingNetworkRequests.length > 0) {
      detected = true
      confidence = Math.max(confidence, 0.75)
      blockingReasons.push('pending network requests')
    }
    
    if (detected) {
      results.push({
        detected: true,
        category: 'blocked-cta',
        confidence: Math.min(confidence, 0.99),
        title: `Blocked CTA: ${payload.selector || 'Unknown element'}`,
        description: `User attempted to click ${group.length} time(s) on ${payload.selector || 'an element'} but it was not interactable. ${blockingReasons.join(', ')}`,
        evidenceIds: group.map(e => e.id),
        metadata: {
          clickCount: group.length,
          selector: payload.selector,
          blockingReasons,
          cssBlockerState,
        },
      })
    }
  }
  
  return results
}