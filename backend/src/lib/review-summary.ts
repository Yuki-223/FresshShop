import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { REVIEW_MODULE } from "../modules/review"
import type ReviewModuleService from "../modules/review/service"

export type RatingSummary = { value: number; count: number }

/**
 * Rating shown in the storefront = the rating collected from the source site
 * (product.metadata.rating, which already includes the collected reviews)
 * merged with the approved reviews written by our own customers.
 */
export async function ratingSummary(container: MedusaContainer, productId: string): Promise<RatingSummary | null> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const reviews: ReviewModuleService = container.resolve(REVIEW_MODULE)
  const {
    data: [product],
  } = await query.graph({ entity: "product", fields: ["id", "metadata"], filters: { id: productId } })
  const initial = (product?.metadata?.rating as RatingSummary | undefined) ?? null
  const own = await reviews.listReviews({ product_id: productId, source: "customer", status: "approved" }, { select: ["rating"] })

  const count = (initial?.count ?? 0) + own.length
  if (!count) return null
  const total = (initial ? initial.value * initial.count : 0) + own.reduce((sum, r) => sum + r.rating, 0)
  return { value: Math.round((total / count) * 100) / 100, count }
}
