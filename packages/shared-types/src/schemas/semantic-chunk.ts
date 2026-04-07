import { z } from 'zod'
export const SemanticChunkSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  startTs: z.number().int().positive(),
  endTs: z.number().int().positive(),
  modalities: z.array(z.enum(['dom-snapshot','user-interaction','network','console','error','performance','replay-frame'])),
  summary: z.string(),
  tokens: z.array(z.string()),
  embeddingId: z.string().optional(),
  evidenceIds: z.array(z.string()),
})
export type SemanticChunk = z.infer<typeof SemanticChunkSchema>
