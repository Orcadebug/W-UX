import type { TimelineEvent } from '@w-ux/shared-types'
import { computeCSSBlockers } from '../utils/element-serializer'

const INTERACTION_EVENTS = ['click', 'pointerdown', 'pointerup', 'focus', 'blur', 'input', 'scroll', 'submit', 'keydown']

export class InteractionCollector {
  private listeners: Map<string, EventListener> = new Map()
  private onEvent: (event: Omit<TimelineEvent, 'id' | 'sessionId'>) => void

  constructor(onEvent: (event: Omit<TimelineEvent, 'id' | 'sessionId'>) => void) {
    this.onEvent = onEvent
  }

  start() {
    for (const eventType of INTERACTION_EVENTS) {
      const listener = (e: Event) => this.handleEvent(eventType, e)
      this.listeners.set(eventType, listener)
      document.addEventListener(eventType, listener, { capture: true, passive: eventType === 'scroll' })
    }
  }

  stop() {
    for (const [eventType, listener] of this.listeners) {
      document.removeEventListener(eventType, listener, { capture: true })
    }
    this.listeners.clear()
  }

  private handleEvent(type: string, event: Event) {
    const target = event.target as HTMLElement
    if (!target?.tagName) return

    const payload: Record<string, unknown> = {
      selector: this.getSelector(target),
      tagName: target.tagName.toLowerCase(),
      text: target.textContent?.trim().slice(0, 100),
    }

    if (type === 'click' && event instanceof MouseEvent) {
      payload.x = event.clientX
      payload.y = event.clientY
      const elementAtPoint = document.elementFromPoint(event.clientX, event.clientY)
      if (elementAtPoint && elementAtPoint !== target) {
        payload.elementFromPointMismatch = true
        payload.elementAtPointSelector = this.getSelector(elementAtPoint as HTMLElement)
        payload.elementAtPointTag = (elementAtPoint as HTMLElement).tagName.toLowerCase()
      }
      payload.cssBlockerState = computeCSSBlockers(target)
    }

    if (type === 'input' && event instanceof InputEvent) {
      payload.inputType = event.inputType
      payload.value = (target as HTMLInputElement).value?.slice(0, 200)
    }

    if (type === 'scroll') {
      payload.scrollX = window.scrollX
      payload.scrollY = window.scrollY
    }

    this.onEvent({
      ts: Date.now(),
      modality: 'user-interaction',
      subtype: type,
      payload,
    })
  }

  private getSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`
    const classes = el.className && typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 3).join('.') : ''
    return `${el.tagName.toLowerCase()}${classes ? '.' + classes : ''}`
  }
}
