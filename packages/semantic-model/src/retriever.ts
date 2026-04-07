import type { Pool } from 'pg'
import type { SemanticChunk } from '@w-ux/shared-types'
import { generateEmbedding } from './embedding-pipeline'

export async function storeChunk(chunk: SemanticChunk, db: Pool): Promise<void> {
  const embedding = await generateEmbedding(chunk.summary)
  
  await db.query(
    `INSERT INTO semantic_chunks (id, session_id, start_ts, end_ts, modalities, summary, tokens, embedding_id, evidence_ids, embedding)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      chunk.id,
      chunk.sessionId,
      chunk.startTs,
      chunk.endTs,
      chunk.modalities,
      chunk.summary,
      chunk.tokens,
      chunk.embeddingId,
      chunk.evidenceIds,
      JSON.stringify(embedding),
    ]
  )
}

export async function retrieveSimilar(
  query: string,
  sessionId: string,
  db: Pool,
  limit: number = 5
): Promise<SemanticChunk[]> {
  const queryEmbedding = await generateEmbedding(query)
  
  const { rows } = await db.query(
    `SELECT id, session_id, start_ts, end_ts, modalities, summary, tokens, embedding_id, evidence_ids,
            1 - (embedding <=> $1) as similarity
     FROM semantic_chunks
     WHERE session_id = $2
     ORDER BY embedding <=> $1
     LIMIT $3`,
    [JSON.stringify(queryEmbedding), sessionId, limit]
  )
  
  return rows.map(row => ({
    id: row.id,
    sessionId: row.session_id,
    startTs: row.start_ts,
    endTs: row.end_ts,
    modalities: row.modalities,
    summary: row.summary,
    tokens: row.tokens,
    embeddingId: row.embedding_id,
    evidenceIds: row.evidence_ids,
  }))
}