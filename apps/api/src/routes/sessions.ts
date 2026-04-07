import type { FastifyInstance } from 'fastify'
import { CreateSessionRequestSchema } from '@w-ux/shared-types'
import { v4 as uuidv4 } from 'uuid'

export async function sessionsRoutes(server: FastifyInstance) {
  server.post('/', { schema: { body: CreateSessionRequestSchema.shape } }, async (request, reply) => {
    const sessionId = uuidv4()
    const startedAt = Date.now()
    const sessionData = {
      id: sessionId,
      appVersion: request.body.appVersion,
      userId: request.body.userId,
      startedAt,
      device: request.body.device,
      environment: request.body.environment,
      metadata: request.body.metadata,
    }
    
    await server.db.query(
      `INSERT INTO sessions (id, app_version, user_id, started_at, device, environment, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [sessionData.id, sessionData.appVersion, sessionData.userId, sessionData.startedAt, 
       JSON.stringify(sessionData.device), JSON.stringify(sessionData.environment), JSON.stringify(sessionData.metadata)]
    )
    
    reply.status(201).send(sessionData)
  })

  server.get('/', async (request, reply) => {
    const { rows } = await server.db.query('SELECT id, app_version, started_at, user_id FROM sessions ORDER BY started_at DESC LIMIT 100')
    reply.status(200).send({
      sessions: rows.map(row => ({
        id: row.id,
        appVersion: row.app_version,
        startedAt: parseInt(row.started_at),
        userId: row.user_id,
      }))
    })
  })

  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { rows } = await server.db.query('SELECT * FROM sessions WHERE id = $1', [id])
    if (rows.length === 0) return reply.status(404).send({ error: 'Session not found' })
    reply.status(200).send({
      ...rows[0],
      device: JSON.parse(rows[0].device),
      environment: JSON.parse(rows[0].environment),
      metadata: rows[0].metadata ? JSON.parse(rows[0].metadata) : undefined,
    })
  })

  server.get('/:id/issue-cards', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { rows: hypothesisRows } = await server.db.query(
      'SELECT * FROM hypotheses WHERE session_id = $1 ORDER BY confidence DESC',
      [id]
    )
    
    const issues = hypothesisRows.map(row => ({
      hypothesis: {
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        confidence: row.confidence,
        verifierStatus: row.verifier_status,
      },
      evidenceSummary: `Based on ${row.evidence_ids?.length || 0} events`,
      affectedElement: {
        selector: row.suspected_components?.[0] || 'unknown',
        tagName: 'button',
      },
      blockingReasons: row.description?.split('. ').slice(0, 3) || ['Unknown issue'],
    }))
    
    reply.status(200).send({ issues })
  })

  server.patch('/:id/end', async (request, reply) => {
    const { id } = request.params as { id: string }
    const endedAt = Date.now()
    
    await server.db.query('UPDATE sessions SET ended_at = $1 WHERE id = $2', [endedAt, id])
    await server.queue.add('session:ended', { sessionId: id })
    reply.status(200).send({ endedAt })
  })
}