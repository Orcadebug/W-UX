# W-UX

Browser session observability system. Ingests DOM events, network activity, and console output — produces root-cause hypotheses, timeline alignment, and Playwright verification scripts.

## Quick Start

```bash
pnpm install
pnpm docker:up
pnpm migrate
pnpm build
```

Start dev servers:

```bash
pnpm --filter @w-ux/api dev       # localhost:3001
pnpm --filter @w-ux/worker dev
pnpm --filter @w-ux/dashboard dev # localhost:3000
```

## Packages

| Package | Description |
|---------|-------------|
| `@w-ux/shared-types` | Zod schemas and TypeScript types |
| `@w-ux/sdk-browser` | Browser SDK — captures interactions, network, DOM snapshots |
| `@w-ux/alignment` | Timeline segmentation and event correlation |
| `@w-ux/reasoning` | Detectors for blocked CTAs, rage clicks, layout issues |
| `@w-ux/semantic-model` | Embeddings and semantic retrieval |
| `@w-ux/reasoning-agents` | LLM-based root cause analysis via Claude API |
| `@w-ux/verifier` | Playwright test generation and verification |

## Apps

| App | Description | Port |
|-----|-------------|------|
| `api` | Fastify REST API and PostHog webhook receiver | 3001 |
| `worker` | BullMQ job processors | — |
| `dashboard` | Next.js UI | 3000 |

## API

```
POST   /api/v1/sessions
GET    /api/v1/sessions
GET    /api/v1/sessions/:id
GET    /api/v1/sessions/:id/issue-cards
PATCH  /api/v1/sessions/:id/end
POST   /api/v1/events
POST   /api/v1/posthog-webhook
GET    /health
```

## Environment Variables

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wux
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
POSTHOG_API_KEY=phc_...
POSTHOG_HOST=https://us.i.posthog.com
POSTHOG_WEBHOOK_SECRET=whsec_...
```

## License

MIT
