import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { markOrderFulfillmentAsDeliveredWorkflow } from "@medusajs/medusa/core-flows"
import { loadOwnOrder } from "../load"

/** POST /store/customers/me/orders/:id/confirm-delivery — 确认收货: every shipped parcel is marked delivered. */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const order = await loadOwnOrder(req)
  const shipped = order.fulfillments.filter((f) => f.shipped_at && !f.delivered_at && !f.canceled_at)
  if (order.status !== "pending" || shipped.length === 0) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Nothing is on its way for this order")
  for (const f of shipped) await markOrderFulfillmentAsDeliveredWorkflow(req.scope).run({ input: { orderId: order.id, fulfillmentId: f.id, no_notification: true } })
  res.json({ ok: true })
}
