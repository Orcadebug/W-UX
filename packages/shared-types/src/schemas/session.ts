import { z } from 'zod'
import { DeviceContextSchema } from './device-context'
export const SessionSchema = z.object({
  id: z.string().uuid(),
  appVersion: z.string(),
  userId: z.string().optional(),
  startedAt: z.number().int().positive(),
  endedAt: z.number().int().positive().optional(),
  device: DeviceContextSchema,
  environment: z.object({
    url: z.string().url(),
    referrer: z.string().optional(),
    queryParams: z.record(z.string()).optional(),
  }),
  metadata: z.record(z.unknown()).optional(),
})
export type Session = z.infer<typeof SessionSchema>
export const CreateSessionRequestSchema = z.object({
  appVersion: z.string(),
  userId: z.string().optional(),
  device: DeviceContextSchema,
  environment: z.object({
    url: z.string().url(),
    referrer: z.string().optional(),
    queryParams: z.record(z.string()).optional(),
  }),
  metadata: z.record(z.unknown()).optional(),
})
export type CreateSessionRequest = z.infer<typeof CreateSessionRequestSchema>
