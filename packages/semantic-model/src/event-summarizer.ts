import type { Moment } from '@w-ux/alignment'

export function summarizeEvents(moment: Moment): string {
  const byModality: Record<string, number> = {}
  const bySubtype: Record<string, number> = {}
  
  for (const event of moment.events) {
    byModality[event.modality] = (byModality[event.modality] || 0) + 1
    bySubtype[event.subtype] = (bySubtype[event.subtype] || 0) + 1
  }
  
  const modalityDesc = Object.entries(byModality)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ')
  
  const duration = moment.endTs - moment.startTs
  
  return `${moment.label || 'Moment'}: ${modalityDesc}, duration ${duration}ms`
}

export function extractUserActions(moment: Moment): string[] {
  const actions: string[] = []
  
  for (const event of moment.events) {
    if (event.modality === 'user-interaction') {
      const payload = event.payload as Record<string, unknown>
      const selector = payload.selector as string
      const subtype = event.subtype
      actions.push(`${subtype} on ${selector}`)
    }
  }
  
  return actions
}