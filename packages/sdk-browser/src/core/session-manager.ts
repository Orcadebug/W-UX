import { v4 as uuidv4 } from 'uuid'
import type { DeviceContext, CreateSessionRequest } from '@w-ux/shared-types'
import type { SDKConfig } from '../config'

export class SessionManager {
  private sessionId: string | null = null
  private startedAt: number | null = null

  constructor(private config: SDKConfig) {}

  createSession(): string {
    this.sessionId = uuidv4()
    this.startedAt = Date.now()
    return this.sessionId
  }

  getSessionId(): string | null {
    return this.sessionId
  }

  getStartedAt(): number | null {
    return this.startedAt
  }

  buildCreateSessionPayload(): CreateSessionRequest {
    return {
      appVersion: this.config.appVersion,
      userId: this.config.userId,
      device: this.getDeviceContext(),
      environment: {
        url: window.location.href,
        referrer: document.referrer || undefined,
        queryParams: Object.fromEntries(new URLSearchParams(window.location.search)),
      },
    }
  }

  private getDeviceContext(): DeviceContext {
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      userAgent: navigator.userAgent,
      pixelRatio: window.devicePixelRatio,
      touchCapable: 'ontouchstart' in window,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }
}
