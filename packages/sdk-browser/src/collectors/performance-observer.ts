import type { TimelineEvent } from '@w-ux/shared-types'

export class PerformanceObserverCollector {
  private onEvent: (event: Omit<TimelineEvent, 'id' | 'sessionId'>) => void
  private observers: PerformanceObserver[] = []

  constructor(onEvent: (event: Omit<TimelineEvent, 'id' | 'sessionId'>) => void) {
    this.onEvent = onEvent
  }

  start() {
    this.observeLCP()
    this.observeFID()
    this.observeCLS()
    this.observeLongTasks()
    this.observeResources()
  }

  stop() {
    for (const obs of this.observers) obs.disconnect()
    this.observers = []
  }

  private observeLCP() {
    try {
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.onEvent({ ts: entry.startTime, modality: 'performance', subtype: 'lcp', payload: { value: entry.startTime, name: (entry as any).name } })
        }
      })
      obs.observe({ type: 'largest-contentful-paint', buffered: true })
      this.observers.push(obs)
    } catch {}
  }

  private observeFID() {
    try {
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const e = entry as any
          this.onEvent({ ts: entry.startTime, modality: 'performance', subtype: 'fid', payload: { value: e.processingStart - entry.startTime } })
        }
      })
      obs.observe({ type: 'first-input', buffered: true })
      this.observers.push(obs)
    } catch {}
  }

  private observeCLS() {
    try {
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.onEvent({ ts: entry.startTime, modality: 'performance', subtype: 'cls', payload: { value: (entry as any).value, hadRecentInput: (entry as any).hadRecentInput } })
        }
      })
      obs.observe({ type: 'layout-shift', buffered: true })
      this.observers.push(obs)
    } catch {}
  }

  private observeLongTasks() {
    try {
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.onEvent({ ts: entry.startTime, modality: 'performance', subtype: 'longtask', payload: { duration: entry.duration, name: entry.name } })
        }
      })
      obs.observe({ type: 'longtask', buffered: true })
      this.observers.push(obs)
    } catch {}
  }

  private observeResources() {
    try {
      const obs = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.onEvent({ ts: entry.startTime, modality: 'performance', subtype: 'resource', payload: { name: entry.name, duration: entry.duration, transferSize: (entry as any).transferSize } })
        }
      })
      obs.observe({ type: 'resource', buffered: true })
      this.observers.push(obs)
    } catch {}
  }
}
