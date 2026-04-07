import type { TimelineEvent } from '@w-ux/shared-types'

export function summarizeDOMSnapshot(event: TimelineEvent): string {
  const payload = event.payload as Record<string, unknown>
  const elements = payload.elements as Array<Record<string, unknown>> | undefined
  
  if (!elements || elements.length === 0) {
    return 'Empty DOM snapshot'
  }
  
  const interactive = elements.filter(el => {
    const tag = el.tagName as string
    return ['button', 'a', 'input', 'select', 'textarea'].includes(tag)
  })
  
  const withBlockers = elements.filter(el => {
    const blockerState = el.cssBlockerState as Record<string, unknown> | undefined
    return blockerState && (
      blockerState.disabled ||
      blockerState.ariaDisabled ||
      blockerState.pointerEvents === 'none' ||
      blockerState.opacity === 0
    )
  })
  
  return `DOM contains ${elements.length} elements, ${interactive.length} interactive, ${withBlockers.length} with blockers`
}

export function extractVisibleText(event: TimelineEvent): string {
  const payload = event.payload as Record<string, unknown>
  const elements = payload.elements as Array<Record<string, unknown>> | undefined
  
  if (!elements) return ''
  
  const texts = elements
    .map(el => el.text as string)
    .filter(Boolean)
    .slice(0, 10)
  
  return texts.join('. ')
}