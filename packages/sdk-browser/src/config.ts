export interface SDKConfig {
  endpoint: string
  appVersion: string
  batchSize?: number
  flushIntervalMs?: number
  userId?: string
  featureFlags?: Record<string, boolean>
}

export const defaultConfig: Required<Omit<SDKConfig, 'endpoint' | 'appVersion' | 'userId'>> = {
  batchSize: 50,
  flushIntervalMs: 2000,
  featureFlags: {
    captureDomSnapshots: true,
    captureInteractions: true,
    captureNetwork: true,
    captureConsole: true,
    captureErrors: true,
    capturePerformance: true,
  },
}
