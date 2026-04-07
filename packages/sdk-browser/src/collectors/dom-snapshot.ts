import { computeCSSBlockers } from '../utils/element-serializer'
import type { TimelineEvent } from '@w-ux/shared-types'

export class DOMSnapshotCollector {
  private observer: MutationObserver | null = null
  private snapshotInterval: ReturnType<typeof setInterval> | null = null
  private onEvent: (event: Omit<TimelineEvent, 'id' | 'sessionId'>) => void

  constructor(onEvent: (event: Omit<TimelineEvent, 'id' | 'sessionId'>) => void) {
    this.onEvent = onEvent
  }

  start() {
    this.takeFullSnapshot()
    this.snapshotInterval = setInterval(() => this.takeFullSnapshot(), 5000)
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          this.captureMutation(mutation)
        }
      }
    })
    this.observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class', 'disabled', 'aria-disabled'] })
  }

  stop() {
    if (this.snapshotInterval) clearInterval(this.snapshotInterval)
    if (this.observer) this.observer.disconnect()
  }

  private takeFullSnapshot() {
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [onclick], [tabindex]:not([tabindex="-1"])')
    const elements = Array.from(interactiveElements).map((el) => {
      const element = el as HTMLElement
      return {
        selector: this.getSelector(element),
        tagName: element.tagName.toLowerCase(),
        text: element.textContent?.trim().slice(0, 100),
        cssBlockerState: computeCSSBlockers(element),
      }
    })
    this.onEvent({
      ts: Date.now(),
      modality: 'dom-snapshot',
      subtype: 'full',
      payload: { elements },
    })
  }

  private captureMutation(mutation: MutationRecord) {
    const target = mutation.target as HTMLElement
    if (!target.tagName) return
    this.onEvent({
      ts: Date.now(),
      modality: 'dom-snapshot',
      subtype: 'mutation',
      payload: {
        selector: this.getSelector(target),
        mutationType: mutation.type,
        attributeName: mutation.attributeName,
        cssBlockerState: computeCSSBlockers(target),
      },
    })
  }

  private getSelector(el: HTMLElement): string {
    if (el.id) return `#${el.id}`
    const parent = el.parentElement
    const tag = el.tagName.toLowerCase()
    if (!parent) return tag
    const siblings = Array.from(parent.children).filter((c) => c.tagName === el.tagName)
    const index = siblings.indexOf(el)
    return siblings.length > 1 ? `${tag}:nth-of-type(${index + 1})` : tag
  }
}
