import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { ratingSummary } from "../../../lib/review-summary"
import { REVIEW_MODULE } from "../../../modules/review"
import type ReviewModuleService from "../../../modules/review/service"
import type { StorePostReviewType } from "./validators"

const PUBLIC_FIELDS = ["id", "product_id", "author_name", "location", "rating", "title", "content", "source", "published_at"] as const

/**
 * GET /store/reviews?product_id=…&limit=10&offset=0 — approved reviews (newest first) + rating summary
 * + `breakdown`: how many of the approved written reviews have 5, 4, 3, 2 and 1 stars (the collected
 * rating summary has no per-star counts, so the storefront's bar chart is based on written reviews only).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productId = String(req.query.product_id ?? "")
  if (!productId) throw new MedusaError(MedusaError.Types.INVALID_DATA, "product_id is required")
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10))
  const offset = Math.max(0, Number(req.query.offset) || 0)

  const service: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)
  const [reviews, count] = await service.listAndCountReviews(
    { product_id: productId, status: "approved" },
    { select: [...PUBLIC_FIELDS], skip: offset, take: limit, order: { published_at: "DESC" } },
  )
  const ratings = await service.listReviews({ product_id: productId, status: "approved" }, { select: ["rating"] })
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({ stars, count: ratings.filter((r) => r.rating === stars).length }))
  res.json({ reviews, count, limit, offset, summary: await ratingSummary(req.scope, productId), breakdown })
}

/** POST /store/reviews — a customer writes a review (auto-approved in this demo). */
export async function POST(req: MedusaRequest<StorePostReviewType>, res: MedusaResponse) {
  const body = req.validatedBody
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [product],
  } = await query.graph({ entity: "product", fields: ["id", "status"], filters: { id: body.product_id } })
  if (!product || product.status !== "published") throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product not found")

  const service: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)
  const review = await service.createReviews({
    product_id: body.product_id,
    rating: body.rating,
    author_name: body.author_name,
    title: body.title || null,
    content: body.content,
    source: "customer",
    status: "approved",
    published_at: new Date(),
  })
  res.status(201).json({ review, summary: await ratingSummary(req.scope, body.product_id) })
}
