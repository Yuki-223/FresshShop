import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BROWSING_HISTORY_MODULE } from "../../../../../modules/browsing-history"
import type BrowsingHistoryModuleService from "../../../../../modules/browsing-history/service"
import { StoreGetBrowsingHistory, type StorePostBrowsingHistoryType } from "./validators"

const service = (req: AuthenticatedMedusaRequest) => req.scope.resolve<BrowsingHistoryModuleService>(BROWSING_HISTORY_MODULE)

/** GET /store/customers/me/browsing-history?limit=&offset= — the signed-in customer's viewed products, newest first. */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  // parsed here: Medusa's validateAndTransformQuery moves limit/offset into its own query config
  const { limit, offset } = StoreGetBrowsingHistory.parse(req.query)
  const [rows, count] = await service(req).listAndCountBrowsingHistories(
    { customer_id: req.auth_context.actor_id },
    { take: limit, skip: offset, order: { viewed_at: "DESC" }, select: ["product_id", "viewed_at"] },
  )
  res.json({ items: rows.map((r) => ({ product_id: r.product_id, viewed_at: r.viewed_at })), count, limit, offset })
}

/**
 * POST /store/customers/me/browsing-history { items: [{ product_id, viewed_at? }] }
 * Records viewed products (`viewed_at` defaults to now, and can't be in the future). Used for
 * every product page view and, with up to 100 items, to merge a guest's history after sign-in.
 */
export async function POST(req: AuthenticatedMedusaRequest<StorePostBrowsingHistoryType>, res: MedusaResponse) {
  const now = new Date()
  const items = req.validatedBody.items.map((i) => ({
    product_id: i.product_id,
    viewed_at: i.viewed_at && i.viewed_at < now ? i.viewed_at : now,
  }))
  await service(req).record(req.auth_context.actor_id, items)
  res.json({ ok: true })
}

/** DELETE /store/customers/me/browsing-history — clears the whole history. */
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const rows = await service(req).listBrowsingHistories({ customer_id: req.auth_context.actor_id }, { select: ["id"] })
  await service(req).deleteBrowsingHistories(rows.map((r) => r.id))
  res.json({ deleted: rows.length })
}
