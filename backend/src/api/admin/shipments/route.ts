import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { listOrderShipments } from "../../../lib/shipments"

/** GET /admin/shipments?order_id= — an order's parcels with the full planned route (future stops included). */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const orderId = typeof req.query.order_id === "string" ? req.query.order_id : null
  if (!orderId) throw new MedusaError(MedusaError.Types.INVALID_DATA, "order_id is required")
  res.json({ shipments: await listOrderShipments(req.scope, orderId, { includeFuture: true }) })
}
