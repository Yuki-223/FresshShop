"use server"

/** Reviews live in the backend review module (backend/src/modules/review). */
import { medusa, MedusaError } from "@/lib/medusa/server"
import { REVIEWS_PAGE_SIZE, type ReviewPage, type SubmitReviewInput } from "./types"

export async function loadReviews(productId: string, offset = 0): Promise<ReviewPage> {
  const page = await medusa<ReviewPage>(
    `/store/reviews?product_id=${encodeURIComponent(productId)}&limit=${REVIEWS_PAGE_SIZE}&offset=${Math.max(0, offset)}`,
  )
  return { reviews: page.reviews, count: page.count, summary: page.summary }
}

/** Saves a customer review and returns the first page again (with the new review on top) plus the new rating. */
export async function submitReview(input: SubmitReviewInput): Promise<{ ok: true; page: ReviewPage } | { ok: false; error: string }> {
  try {
    await medusa("/store/reviews", {
      body: {
        product_id: input.productId,
        rating: input.rating,
        author_name: input.authorName.trim(),
        title: input.title?.trim() || undefined,
        content: input.content.trim(),
      },
    })
  } catch (error) {
    if (error instanceof MedusaError && error.status < 500) return { ok: false, error: error.message }
    throw error
  }
  return { ok: true, page: await loadReviews(input.productId) }
}
