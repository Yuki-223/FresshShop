import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../modules/review"
import type ReviewModuleService from "../../../modules/review/service"

/** GET /admin/reviews?product_id=…&source=customer&limit=20&offset=0 — every review, for the store owner. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const filters: Record<string, string> = {}
  for (const key of ["product_id", "source", "status"]) if (req.query[key]) filters[key] = String(req.query[key])
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
  const offset = Math.max(0, Number(req.query.offset) || 0)

  const service: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)
  const [reviews, count] = await service.listAndCountReviews(filters, { skip: offset, take: limit, order: { published_at: "DESC" } })
  res.json({ reviews, count, limit, offset })
}
