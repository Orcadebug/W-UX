import type { TimelineEvent } from '@w-ux/shared-types'

export class BatchTransport {
  private queue: TimelineEvent[] = []
  private flushTimer: ReturnType<typeof setTimeout> | null = null
  private flushing = false
  private retries = 0
  private maxRetries = 3

  constructor(
    private endpoint: string,
    private batchSize: number,
    private flushIntervalMs: number,
    private getSessionId: () => string | null
  ) {}

  enqueue(event: Omit<TimelineEvent, 'id' | 'sessionId'> & { id?: string }) {
    this.queue.push(event as TimelineEvent)
    if (this.queue.length >= this.batchSize) {
      this.flush()
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.flushIntervalMs)
    }
  }

  async flush() {
    if (this.flushing || this.queue.length === 0) return
    this.flushing = true
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }

    const sessionId = this.getSessionId()
    if (!sessionId) {
      this.flushing = false
      return
    }

    const batch = this.queue.splice(0, this.batchSize)
    try {
      await this.sendBatch(sessionId, batch)
      this.retries = 0
    } catch {
      this.retries++
      if (this.retries < this.maxRetries) {
        this.queue.unshift(...batch)
        setTimeout(() => this.flush(), Math.pow(2, this.retries) * 1000)
      }
    }
    this.flushing = false
  }

  private async sendBatch(sessionId: string, events: TimelineEvent[]) {
    const response = await fetch(`${this.endpoint}/api/v1/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, events }),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
  }

  flushOnUnload() {
    const data = JSON.stringify({ sessionId: this.getSessionId(), events: this.queue })
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${this.endpoint}/api/v1/events`, new Blob([data], { type: 'application/json' }))
    }
    this.queue = []
  }

  destroy() {
    if (this.flushTimer) clearTimeout(this.flushTimer)
    this.queue = []
  }
}
