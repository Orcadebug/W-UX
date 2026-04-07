import type { SDKConfig } from './config'
import { defaultConfig } from './config'
import { SessionManager } from './core/session-manager'
import { BatchTransport } from './core/transport'
import { DOMSnapshotCollector } from './collectors/dom-snapshot'
import { InteractionCollector } from './collectors/interaction'
import { NetworkCollector } from './collectors/network'
import { ConsoleCapture } from './collectors/console-capture'
import { ErrorCapture } from './collectors/error-capture'
import { PerformanceObserverCollector } from './collectors/performance-observer'

let sessionManager: SessionManager | null = null
let transport: BatchTransport | null = null
let collectors: Array<{ start: () => void; stop: () => void }> = []
let initialized = false

function enqueueEvent(event: Omit<import('@w-ux/shared-types').TimelineEvent, 'id' | 'sessionId'>) {
  transport?.enqueue(event)
}

export const WUX = {
  init(config: SDKConfig) {
    if (initialized) return
    initialized = true

    const mergedConfig = { ...defaultConfig, ...config }
    sessionManager = new SessionManager(mergedConfig)
    transport = new BatchTransport(mergedConfig.endpoint, mergedConfig.batchSize!, mergedConfig.flushIntervalMs!, () => sessionManager?.getSessionId() ?? null)

    sessionManager.createSession()
    const createPayload = sessionManager.buildCreateSessionPayload()
    transport.enqueue({ ts: Date.now(), modality: 'user-interaction', subtype: 'session-start', payload: createPayload })

    collectors = [
      new DOMSnapshotCollector(enqueueEvent),
      new InteractionCollector(enqueueEvent),
      new NetworkCollector(enqueueEvent),
      new ConsoleCapture(enqueueEvent),
      new ErrorCapture(enqueueEvent),
      new PerformanceObserverCollector(enqueueEvent),
    ]

    for (const c of collectors) c.start()

    window.addEventListener('beforeunload', () => transport?.flushOnUnload())
  },

  shutdown() {
    transport?.flush()
    transport?.destroy()
    for (const c of collectors) c.stop()
    collectors = []
    initialized = false
  },

  getSessionId() {
    return sessionManager?.getSessionId() ?? null
  },
}

export { computeCSSBlockers } from './utils/element-serializer'
export type { SDKConfig } from './config'
