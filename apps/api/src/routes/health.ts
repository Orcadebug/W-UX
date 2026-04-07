import type { FastifyInstance } from 'fastify'

export async function healthRoutes(server: FastifyInstance) {
  server.get('/health', async (request, reply) => {
    let database = 'connected', redis = 'connected'
    
    try {
      await server.db.query('SELECT 1')
    } catch {
      database = 'disconnected'
    }
    
    try {
      await server.queueConnection.ping()
    } catch {
      redis = 'disconnected'
    }
    
    const response = {
      status: database === 'connected' && redis === 'connected' ? 'ok' : 'degraded',
      timestamp: Date.now(),
      services: { database, redis }
    }
    
    reply.status(200).send(response)
  })
}