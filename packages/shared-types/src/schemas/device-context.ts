import { z } from 'zod'
export const DeviceContextSchema = z.object({
  viewportWidth: z.number(),
  viewportHeight: z.number(),
  userAgent: z.string(),
  pixelRatio: z.number(),
  touchCapable: z.boolean(),
  platform: z.string(),
  language: z.string().optional(),
  timezone: z.string().optional(),
})
export type DeviceContext = z.infer<typeof DeviceContextSchema>
