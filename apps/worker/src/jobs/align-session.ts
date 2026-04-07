import { Pool } from 'pg'
import { alignSession } from '@w-ux/alignment'

export async function alignSessionJob(sessionId: string, db: Pool) {
  const timeline = await alignSession(sessionId, db)
  return { sessionId, status: 'aligned', momentCount: timeline.moments.length }
}