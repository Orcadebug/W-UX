import type { CSSBlockerState } from '@w-ux/shared-types'

export function computeCSSBlockers(el: HTMLElement): CSSBlockerState {
  const style = window.getComputedStyle(el)
  const rect = el.getBoundingClientRect()

  return {
    pointerEvents: style.pointerEvents || undefined,
    opacity: parseFloat(style.opacity) || undefined,
    visibility: style.visibility !== 'visible' ? style.visibility : undefined,
    display: style.display === 'none' ? style.display : undefined,
    zIndex: style.zIndex !== 'auto' ? parseInt(style.zIndex, 10) : undefined,
    disabled: (el as HTMLButtonElement | HTMLInputElement).disabled || undefined,
    ariaDisabled: el.getAttribute('aria-disabled') === 'true' || undefined,
    boundingRect: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
    },
    isOffscreen: rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth,
    overlappingElements: findOverlappingElements(el, rect),
  }
}

function findOverlappingElements(target: HTMLElement, targetRect: DOMRect): Array<{ tag: string; className: string; zIndex?: number; boundingRect?: DOMRect }> {
  const targetStyle = window.getComputedStyle(target)
  const targetZ = targetStyle.zIndex !== 'auto' ? parseInt(targetStyle.zIndex, 10) : 0

  const cx = targetRect.left + targetRect.width / 2
  const cy = targetRect.top + targetRect.height / 2
  const candidates = document.elementsFromPoint(cx, cy)

  return candidates
    .filter((el) => {
      if (el === target || !el.parentElement) return false
      const htmlEl = el as HTMLElement
      const elStyle = window.getComputedStyle(htmlEl)
      if (elStyle.pointerEvents === 'none' || elStyle.display === 'none' || elStyle.visibility === 'hidden') return false
      const elZ = elStyle.zIndex !== 'auto' ? parseInt(elStyle.zIndex, 10) : 0
      return elZ > targetZ
    })
    .map((el) => {
      const htmlEl = el as HTMLElement
      const elStyle = window.getComputedStyle(htmlEl)
      const elZ = elStyle.zIndex !== 'auto' ? parseInt(elStyle.zIndex, 10) : 0
      return {
        tag: htmlEl.tagName.toLowerCase(),
        className: htmlEl.className && typeof htmlEl.className === 'string' ? htmlEl.className : '',
        zIndex: elZ || undefined,
        boundingRect: htmlEl.getBoundingClientRect(),
      }
    })
}
