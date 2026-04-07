import { z } from 'zod'
export const IntentGapSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  hypothesisId: z.string().uuid(),
  userIntent: z.string(),
  observedOutcome: z.string(),
  blockingCondition: z.string(),
  likelyRootCause: z.string(),
  createdAt: z.number().int().positive(),
})
export type IntentGap = z.infer<typeof IntentGapSchema>
