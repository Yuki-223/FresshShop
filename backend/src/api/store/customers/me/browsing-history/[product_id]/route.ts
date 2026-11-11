import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BROWSING_HISTORY_MODULE } from "../../../../../../modules/browsing-history"
import type BrowsingHistoryModuleService from "../../../../../../modules/browsing-history/service"

/** DELETE /store/customers/me/browsing-history/:product_id — removes one product from the history. */
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<BrowsingHistoryModuleService>(BROWSING_HISTORY_MODULE)
  const rows = await service.listBrowsingHistories({ customer_id: req.auth_context.actor_id, product_id: req.params.product_id }, { select: ["id"] })
  await service.deleteBrowsingHistories(rows.map((r) => r.id))
  res.json({ deleted: rows.length })
}
