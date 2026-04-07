import { Pool } from 'pg'
import { v4 as uuidv4 } from 'uuid'

const db = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wux' })

async function seedBlockedCTAScenario() {
  const sessionId = uuidv4()
  const now = Date.now()

  // Create session
  await db.query(
    `INSERT INTO sessions (id, app_version, started_at, device, environment) VALUES ($1, $2, $3, $4, $5)`,
    [
      sessionId,
      '1.0.0-test',
      now,
      JSON.stringify({ viewportWidth: 1920, viewportHeight: 1080, userAgent: 'Test Agent', pixelRatio: 1, touchCapable: false, platform: 'test' }),
      JSON.stringify({ url: 'https://example.com/checkout' }),
    ]
  )

  // Create events simulating blocked CTA scenario
  const events = [
    // Initial page load
    {
      id: uuidv4(),
      sessionId,
      ts: now,
      modality: 'dom-snapshot',
      subtype: 'full',
      payload: JSON.stringify({ elements: [{ selector: 'button.submit', tagName: 'button', text: 'Complete Order', cssBlockerState: { disabled: false } }] }),
    },
    // User clicks submit button 4 times
    ...Array.from({ length: 4 }, (_, i) => ({
      id: uuidv4(),
      sessionId,
      ts: now + 1000 + i * 500,
      modality: 'user-interaction',
      subtype: 'click',
      payload: JSON.stringify({ 
        selector: 'button.submit', 
        x: 500, 
        y: 300,
        elementFromPointMismatch: true,
        elementAtPointSelector: 'div.modal-overlay',
        elementAtPointTag: 'div',
      }),
      cssBlockerState: JSON.stringify({ 
        disabled: false,
        pointerEvents: 'none',
        overlappingElements: [{ tag: 'div', className: 'modal-overlay', zIndex: 1000 }],
      }),
    })),
    // Network request pending
    {
      id: uuidv4(),
      sessionId,
      ts: now + 1500,
      modality: 'network',
      subtype: 'fetch',
      payload: JSON.stringify({ url: '/api/checkout', method: 'POST' }),
    },
  ]

  for (const event of events) {
    await db.query(
      `INSERT INTO timeline_events (id, session_id, ts, modality, subtype, payload, css_blocker_state, correlation_ids) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [event.id, event.sessionId, event.ts, event.modality, event.subtype, event.payload, event.cssBlockerState, null]
    )
  }

  console.log(`Created test session: ${sessionId}`)
  console.log('Run the worker to process: pnpm --filter @w-ux/worker dev')
  console.log(`Then query: curl http://localhost:3001/api/v1/sessions/${sessionId}/issue-cards`)
  
  await db.end()
}

seedBlockedCTAScenario().catch(console.error)