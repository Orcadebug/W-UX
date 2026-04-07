import type { DetectorResult } from '@w-ux/alignment'
import type { SemanticChunk } from '@w-ux/shared-types'

export interface RootCauseAnalysis {
  hypothesis: string
  rootCause: string
  contributingFactors: string[]
  recommendedFix: string
  confidence: number
}

export function analyzeRootCause(
  detectorResults: DetectorResult[],
  chunks: SemanticChunk[]
): RootCauseAnalysis[] {
  const analyses: RootCauseAnalysis[] = []
  
  for (const result of detectorResults) {
    if (!result.detected) continue
    
    const relevantChunks = chunks.filter(c => 
      result.evidenceIds.some(id => c.evidenceIds.includes(id))
    )
    
    const rootCause = deduceRootCause(result, relevantChunks)
    
    analyses.push({
      hypothesis: result.title,
      rootCause: rootCause.cause,
      contributingFactors: rootCause.factors,
      recommendedFix: rootCause.fix,
      confidence: result.confidence,
    })
  }
  
  return analyses
}

function deduceRootCause(
  result: DetectorResult,
  chunks: SemanticChunk[]
): { cause: string; factors: string[]; fix: string } {
  const factors: string[] = []
  let cause = 'Unknown'
  let fix = 'Investigate further'
  
  if (result.category === 'blocked-cta') {
    const metadata = result.metadata as Record<string, unknown> | undefined
    const blockingReasons = metadata?.blockingReasons as string[] | undefined
    
    if (blockingReasons?.includes('pointer-events: none')) {
      cause = 'CSS pointer-events blocking interaction'
      fix = 'Remove pointer-events: none or add proper z-index layering'
    } else if (blockingReasons?.includes('element disabled')) {
      cause = 'Element remains disabled after form validation'
      fix = 'Enable button when form is valid, or show validation errors'
    } else if (blockingReasons?.includes('elementFromPoint mismatch')) {
      cause = 'Modal/overlay blocking click without proper dismissal'
      fix = 'Ensure modal closes on success or add click-through prevention'
    }
    
    factors.push(...(blockingReasons || []))
  }
  
  if (result.category === 'rage-click') {
    cause = 'UI unresponsive to user interaction'
    fix = 'Add loading states, optimize performance, or provide feedback'
    factors.push('No visual feedback', 'Performance issue suspected')
  }
  
  return { cause, factors, fix }
}