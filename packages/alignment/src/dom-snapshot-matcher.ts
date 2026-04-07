import type { TimelineEvent } from '@w-ux/shared-types'

export function findNearestDomSnapshot(ts: number, domSnapshots: TimelineEvent[], windowMs: number = 100): TimelineEvent | null {
  const sorted = [...domSnapshots].sort((a, b) => a.ts - b.ts)
  
  let left = 0
  let right = sorted.length - 1
  let nearest: TimelineEvent | null = null
  let minDiff = windowMs
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const diff = Math.abs(sorted[mid].ts - ts)
    
    if (diff < minDiff) {
      minDiff = diff
      nearest = sorted[mid]
    }
    
    if (sorted[mid].ts < ts) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  
  return nearest
}