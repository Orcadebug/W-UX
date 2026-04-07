import type { Pool } from 'pg'
import type { AlignedSessionTimeline } from './types'
import { normalizeTimestamps } from './timestamp-normalizer'
import { segmentEvents } from './segmenter'
import { linkCorrelations } from './correlation-linker'

export async function alignSession(sessionId: string, db: Pool): Promise<AlignedSessionTimeline> {
  const sessionResult = await db.query('SELECT started_at FROM sessions WHERE id = $1', [sessionId])
  if (sessionResult.rows.length === 0) {
    throw new Error(`Session ${sessionId} not found`)
  }
  
  const sessionStartedAt = parseInt(sessionResult.rows[0].started_at)
  
  const eventsResult = await db.query(
    'SELECT * FROM timeline_events WHERE session_id = $1 ORDER BY ts ASC',
    [sessionId]
  )
  
  const events = eventsResult.rows.map(row => ({
    id: row.id,
    sessionId: row.session_id,
    ts: parseInt(row.ts),
    modality: row.modality,
    subtype: row.subtype,
    payload: row.payload,
    correlationIds: row.correlation_ids,
    cssBlockerState: row.css_blocker_state,
  }))
  
  const normalizedEvents = normalizeTimestamps(events, sessionStartedAt)
  const correlatedEvents = linkCorrelations(normalizedEvents)
  const moments = segmentEvents(correlatedEvents)
  
  const timeline: AlignedSessionTimeline = {
    sessionId,
    moments,
    duration: moments.length > 0 ? moments[moments.length - 1].endTs - moments[0].startTs : 0,
    eventCount: events.length,
  }
  
  await db.query(
    `INSERT INTO session_timelines (session_id, timeline) VALUES ($1, $2)
     ON CONFLICT (session_id) DO UPDATE SET timeline = $2, created_at = NOW()`,
    [sessionId, JSON.stringify(timeline)]
  )
  
  return timeline
}

export * from './types'
export { normalizeTimestamps } from './timestamp-normalizer'
export { segmentEvents } from './segmenter'
export { linkCorrelations } from './correlation-linker'
export { findNearestDomSnapshot } from './dom-snapshot-matcher'