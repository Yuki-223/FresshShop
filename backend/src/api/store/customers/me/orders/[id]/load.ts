import type { AuthenticatedMedusaRequest } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

export type OwnOrder = {
  id: string
  status: string
  fulfillments: { id: string; shipped_at: Date | null; delivered_at: Date | null; canceled_at: Date | null }[]
}

/** The order `:id` if it belongs to the signed-in customer; 404 otherwise (never reveal other customers' orders). */
export async function loadOwnOrder(req: AuthenticatedMedusaRequest): Promise<OwnOrder> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: ["id", "status", "customer_id", "fulfillments.id", "fulfillments.shipped_at", "fulfillments.delivered_at", "fulfillments.canceled_at"],
    filters: { id: req.params.id },
  })
  if (!order || order.customer_id !== req.auth_context.actor_id) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found")
  return { id: order.id, status: order.status, fulfillments: (order.fulfillments ?? []).filter((f) => !!f) as OwnOrder["fulfillments"] }
}
