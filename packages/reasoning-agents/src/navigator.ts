import type { Moment } from '@w-ux/alignment'

export function identifyNavigationPath(moments: Moment[]): string[] {
  const path: string[] = []
  
  for (const moment of moments) {
    const navEvents = moment.events.filter(e => 
      e.modality === 'network' || 
      (e.modality === 'user-interaction' && e.subtype === 'click')
    )
    
    if (navEvents.length > 0) {
      path.push(moment.label || 'step')
    }
  }
  
  return path
}

export function extractKeyInteractions(moments: Moment[]): Array<{
  ts: number
  type: string
  description: string
}> {
  const interactions: Array<{ ts: number; type: string; description: string }> = []
  
  for (const moment of moments) {
    for (const event of moment.events) {
      if (event.modality === 'user-interaction' && event.subtype === 'click') {
        const payload = event.payload as Record<string, unknown>
        interactions.push({
          ts: event.ts,
          type: 'click',
          description: `Click on ${payload.selector || 'unknown element'}`,
        })
      }
    }
  }
  
  return interactions
}