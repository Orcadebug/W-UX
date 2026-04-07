import type { Moment } from '@w-ux/alignment'

export interface IntentAnalysis {
  momentId: string
  inferredIntent: string
  likelyGoal: string
  confidence: number
}

export function inferUserIntent(moments: Moment[]): IntentAnalysis[] {
  const analyses: IntentAnalysis[] = []
  
  for (const moment of moments) {
    const clicks = moment.events.filter(e => 
      e.modality === 'user-interaction' && e.subtype === 'click'
    )
    const inputs = moment.events.filter(e => 
      e.modality === 'user-interaction' && e.subtype === 'input'
    )
    
    let inferredIntent = 'browsing'
    let likelyGoal = 'explore content'
    let confidence = 0.5
    
    if (clicks.length > 0) {
      const submitClicks = clicks.filter(c => {
        const payload = c.payload as Record<string, unknown>
        const selector = payload.selector as string
        return selector?.includes('submit') || selector?.includes('button')
      })
      
      if (submitClicks.length > 0 && inputs.length > 0) {
        inferredIntent = 'form submission'
        likelyGoal = 'complete a form'
        confidence = 0.85
      } else if (submitClicks.length > 0) {
        inferredIntent = 'action submission'
        likelyGoal = 'trigger an action'
        confidence = 0.8
      } else {
        inferredIntent = 'navigation'
        likelyGoal = 'navigate to new page'
        confidence = 0.7
      }
    }
    
    analyses.push({
      momentId: moment.id,
      inferredIntent,
      likelyGoal,
      confidence,
    })
  }
  
  return analyses
}