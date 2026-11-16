import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { listOrderShipments } from "../../../../../../../lib/shipments"
import { loadOwnOrder } from "../load"

/** GET /store/customers/me/orders/:id/shipments — 查看物流: the order's parcels and what has happened to them so far. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const order = await loadOwnOrder(req)
  res.json({ shipments: await listOrderShipments(req.scope, order.id) })
}
