import type { TimelineEvent } from '@w-ux/shared-types'

export class ConsoleCapture {
  private onEvent: (event: Omit<TimelineEvent, 'id' | 'sessionId'>) => void
  private originalMethods: Record<string, Function> = {}

  constructor(onEvent: (event: Omit<TimelineEvent, 'id' | 'sessionId'>) => void) {
    this.onEvent = onEvent
  }

  start() {
    for (const level of ['log', 'warn', 'error', 'info', 'debug']) {
      this.originalMethods[level] = console[level]
      const onEvent = this.onEvent
      console[level] = function(...args: unknown[]) {
        onEvent({
          ts: Date.now(),
          modality: 'console',
          subtype: level,
          payload: { args: args.map((a) => String(a).slice(0, 500)) },
        })
        return (this as any).__original.apply(this, args)
      }
    }
  }

  stop() {
    for (const level of Object.keys(this.originalMethods)) {
      console[level as keyof Console] = this.originalMethods[level]
    }
  }
}
