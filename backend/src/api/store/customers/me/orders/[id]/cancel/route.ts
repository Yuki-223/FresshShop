import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { cancelOrderFulfillmentWorkflow, cancelOrderWorkflow } from "@medusajs/medusa/core-flows"
import { loadOwnOrder } from "../load"

/**
 * POST /store/customers/me/orders/:id/cancel — the customer cancels their own order.
 * Only while nothing has shipped (Taobao's 待付款 / 待发货): packed-but-unshipped
 * fulfillments are canceled first, then the order (which releases the payment).
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const order = await loadOwnOrder(req)
  if (order.status !== "pending") throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This order can no longer be canceled")
  const open = order.fulfillments.filter((f) => !f.canceled_at)
  if (open.some((f) => f.shipped_at)) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This order has already shipped")
  for (const f of open) await cancelOrderFulfillmentWorkflow(req.scope).run({ input: { order_id: order.id, fulfillment_id: f.id, no_notification: true } })
  await cancelOrderWorkflow(req.scope).run({ input: { order_id: order.id, canceled_by: req.auth_context.actor_id, no_notification: true } })
  res.json({ ok: true })
}
