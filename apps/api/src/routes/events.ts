import type { FastifyInstance } from 'fastify'
import { IngestEventsRequestSchema } from '@w-ux/shared-types'

export async function eventsRoutes(server: FastifyInstance) {
  server.post('/', { schema: { body: IngestEventsRequestSchema.shape } }, async (request, reply) => {
    const { sessionId, events } = request.body
    
    const client = await server.db.connect()
    try {
      await client.query('BEGIN')
      for (const event of events) {
        await client.query(
          `INSERT INTO timeline_events (session_id, ts, modality, subtype, payload, css_blocker_state, correlation_ids) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [sessionId, event.ts, event.modality, event.subtype, JSON.stringify(event.payload),
           event.cssBlockerState ? JSON.stringify(event.cssBlockerState) : null, event.correlationIds]
        )
      }
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
    
    await server.queue.add('session:events-ingested', { sessionId })
    reply.status(200).send({ message: `${events.length} events ingested` })
  })
}