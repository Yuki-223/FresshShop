import { z } from "@medusajs/framework/zod"
import { TRACKING_CODES } from "../../../../../modules/shipment-tracking/models/tracking-event"

export const AdminPostTrackingEvent = z.object({
  code: z.enum(TRACKING_CODES),
  location: z.string().trim().max(200).optional(),
  note: z.string().trim().max(500).optional(),
  occurred_at: z.coerce.date().optional(),
})
export type AdminPostTrackingEventType = z.infer<typeof AdminPostTrackingEvent>
