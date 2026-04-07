import { Pool } from 'pg'
import { DetectionPipeline } from '@w-ux/reasoning'

export async function detectIssuesJob(sessionId: string, db: Pool) {
  const pipeline = new DetectionPipeline()
  
  const { rows: [timelineRow] } = await db.query(
    'SELECT timeline FROM session_timelines WHERE session_id = $1',
    [sessionId]
  )
  
  if (!timelineRow) {
    throw new Error(`Timeline not found for session ${sessionId}`)
  }
  
  const timeline = JSON.parse(timelineRow.timeline)
  const { rows: eventRows } = await db.query(
    'SELECT * FROM timeline_events WHERE session_id = $1',
    [sessionId]
  )
  
  const events = eventRows.map(row => ({
    ...row,
    payload: row.payload,
    cssBlockerState: row.css_blocker_state,
  }))
  
  const ctx = { sessionId, timeline, events }
  const results = await pipeline.run(ctx)
  const hypotheses = pipeline.toHypotheses(results, sessionId)
  
  for (const hypothesis of hypotheses) {
    await db.query(
      `INSERT INTO hypotheses (id, session_id, title, description, category, confidence, evidence_ids, suspected_files, suspected_components, verifier_status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        hypothesis.id,
        hypothesis.sessionId,
        hypothesis.title,
        hypothesis.description,
        hypothesis.category,
        hypothesis.confidence,
        hypothesis.evidenceIds,
        hypothesis.suspectedFiles || null,
        hypothesis.suspectedComponents || null,
        hypothesis.verifierStatus,
        hypothesis.createdAt,
      ]
    )
  }
  
  return { sessionId, status: 'detected', hypothesisCount: hypotheses.length }
}