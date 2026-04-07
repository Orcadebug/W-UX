import { z } from 'zod'
import { SessionSchema } from './session'
import { HypothesisSchema, IssueCardSchema } from './hypothesis'
export const SessionResponseSchema = SessionSchema
export type SessionResponse = z.infer<typeof SessionResponseSchema>
export const HypothesisListResponseSchema = z.object({
  hypotheses: z.array(HypothesisSchema),
  total: z.number(),
})
export type HypothesisListResponse = z.infer<typeof HypothesisListResponseSchema>
export const HealthResponseSchema = z.object({
  status: z.enum(['ok','degraded','error']),
  timestamp: z.number(),
  services: z.object({ database:z.enum(['connected','disconnected']), redis:z.enum(['connected','disconnected']) }),
})
export type HealthResponse = z.infer<typeof HealthResponseSchema>
export { IssueCardSchema }
export type { IssueCard } from './hypothesis'
