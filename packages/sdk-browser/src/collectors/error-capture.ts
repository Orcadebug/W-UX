import type { TimelineEvent } from '@w-ux/shared-types'

export class ErrorCapture {
  private onEvent: (event: Omit<TimelineEvent, 'id' | 'sessionId'>) => void
  private errorHandler: ((event: ErrorEvent) => void) | null = null
  private rejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null

  constructor(onEvent: (event: Omit<TimelineEvent, 'id' | 'sessionId'>) => void) {
    this.onEvent = onEvent
  }

  start() {
    this.errorHandler = (e: ErrorEvent) => {
      this.onEvent({
        ts: Date.now(),
        modality: 'error',
        subtype: 'uncaught',
        payload: { message: e.message, filename: e.filename, lineno: e.lineno, colno: e.colno, stack: e.error?.stack },
      })
    }
    this.rejectionHandler = (e: PromiseRejectionEvent) => {
      this.onEvent({
        ts: Date.now(),
        modality: 'error',
        subtype: 'unhandledrejection',
        payload: { reason: e.reason instanceof Error ? e.reason.message : String(e.reason).slice(0, 500), stack: e.reason instanceof Error ? e.reason.stack : undefined },
      })
    }
    window.addEventListener('error', this.errorHandler)
    window.addEventListener('unhandledrejection', this.rejectionHandler)
  }

  stop() {
    if (this.errorHandler) window.removeEventListener('error', this.errorHandler)
    if (this.rejectionHandler) window.removeEventListener('unhandledrejection', this.rejectionHandler)
  }
}
