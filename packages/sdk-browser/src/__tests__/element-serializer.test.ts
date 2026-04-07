import { describe, it, expect, beforeEach } from 'vitest'
import { computeCSSBlockers } from '../utils/element-serializer'

describe('computeCSSBlockers', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('detects pointer-events none', () => {
    const btn = document.createElement('button')
    btn.style.pointerEvents = 'none'
    document.body.appendChild(btn)
    const result = computeCSSBlockers(btn)
    expect(result.pointerEvents).toBe('none')
  })

  it('detects disabled state', () => {
    const btn = document.createElement('button')
    btn.disabled = true
    document.body.appendChild(btn)
    const result = computeCSSBlockers(btn)
    expect(result.disabled).toBe(true)
  })

  it('detects aria-disabled', () => {
    const btn = document.createElement('button')
    btn.setAttribute('aria-disabled', 'true')
    document.body.appendChild(btn)
    const result = computeCSSBlockers(btn)
    expect(result.ariaDisabled).toBe(true)
  })

  it('detects opacity 0', () => {
    const btn = document.createElement('button')
    btn.style.opacity = '0'
    document.body.appendChild(btn)
    const result = computeCSSBlockers(btn)
    expect(result.opacity).toBe(0)
  })

  it('detects visibility hidden', () => {
    const btn = document.createElement('button')
    btn.style.visibility = 'hidden'
    document.body.appendChild(btn)
    const result = computeCSSBlockers(btn)
    expect(result.visibility).toBe('hidden')
  })

  it('captures bounding rect', () => {
    const btn = document.createElement('button')
    document.body.appendChild(btn)
    const result = computeCSSBlockers(btn)
    expect(result.boundingRect).toBeDefined()
    expect(result.boundingRect?.width).toBeGreaterThanOrEqual(0)
  })
})
