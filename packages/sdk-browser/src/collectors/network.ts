import type { TimelineEvent } from '@w-ux/shared-types'

export class NetworkCollector {
  private onEvent: (event: Omit<TimelineEvent, 'id' | 'sessionId'>) => void
  private originalFetch: typeof fetch | null = null
  private originalXHROpen: XMLHttpRequest.prototype.open | null = null
  private originalXHRSend: XMLHttpRequest.prototype.send | null = null

  constructor(onEvent: (event: Omit<TimelineEvent, 'id' | 'sessionId'>) => void) {
    this.onEvent = onEvent
  }

  start() {
    this.patchFetch()
    this.patchXHR()
  }

  stop() {
    if (this.originalFetch) {
      window.fetch = this.originalFetch
    }
    if (this.originalXHROpen) {
      XMLHttpRequest.prototype.open = this.originalXHROpen as any
    }
    if (this.originalXHRSend) {
      XMLHttpRequest.prototype.send = this.originalXHRSend as any
    }
  }

  private patchFetch() {
    const originalFetch = window.fetch
    this.originalFetch = originalFetch
    const onEvent = this.onEvent
    window.fetch = async function patchedFetch(input: RequestInfo | URL, init?: RequestInit) {
      const startTs = Date.now()
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      const method = init?.method || 'GET'
      try {
        const response = await originalFetch.call(window, input, init)
        const duration = Date.now() - startTs
        onEvent({
          ts: startTs,
          modality: 'network',
          subtype: 'fetch',
          payload: { url, method, status: response.status, duration, ok: response.ok },
        })
        return response
      } catch (error) {
        const duration = Date.now() - startTs
        onEvent({
          ts: startTs,
          modality: 'network',
          subtype: 'fetch',
          payload: { url, method, error: error instanceof Error ? error.message : 'Unknown', duration },
        })
        throw error
      }
    } as typeof fetch
  }

  private patchXHR() {
    const onEvent = this.onEvent
    const proto = XMLHttpRequest.prototype
    this.originalXHROpen = proto.open
    const originalOpen = this.originalXHROpen
    proto.open = function(method: string, url: string) {
      (this as any).__wux_method = method
      (this as any).__wux_url = url
      (this as any).__wux_startTs = Date.now()
      return originalOpen.apply(this, arguments as any)
    }
    this.originalXHRSend = proto.send
    const originalSend = this.originalXHRSend
    proto.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
      const xhr = this as XMLHttpRequest
      const startTs = (xhr as any).__wux_startTs || Date.now()
      xhr.addEventListener('load', () => {
        onEvent({
          ts: startTs,
          modality: 'network',
          subtype: 'xhr',
          payload: { url: (xhr as any).__wux_url, method: (xhr as any).__wux_method, status: xhr.status, duration: Date.now() - startTs },
        })
      })
      xhr.addEventListener('error', () => {
        onEvent({
          ts: startTs,
          modality: 'network',
          subtype: 'xhr',
          payload: { url: (xhr as any).__wux_url, method: (xhr as any).__wux_method, error: 'Network error', duration: Date.now() - startTs },
        })
      })
      return originalSend.apply(this, arguments as any)
    }
  }
}
