import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { addEvent } from "../../../../../lib/shipments"
import type { AdminPostTrackingEventType } from "./validators"

/** POST /admin/shipments/:id/events { code, location?, note?, occurred_at? } — add a tracking line by hand. */
export async function POST(req: AuthenticatedMedusaRequest<AdminPostTrackingEventType>, res: MedusaResponse) {
  const event = await addEvent(req.scope, req.params.id, req.validatedBody)
  res.status(201).json({ event })
}
