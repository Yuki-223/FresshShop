import type { Rating } from "@/types"

/** Reviews loaded per page ("Show more reviews"). Lives here because "use server" files may only export async functions. */
export const REVIEWS_PAGE_SIZE = 5

/** A review as returned by the backend review module (GET /store/reviews). */
export interface ProductReview {
  id: string
  author_name: string
  location: string | null
  rating: number
  title: string | null
  content: string
  /** "collected" = imported from the brand website, "customer" = written in this store, "demo" = made-up sample */
  source: "collected" | "customer" | "demo"
  published_at: string
}

export interface ReviewPage {
  reviews: ProductReview[]
  count: number
  /** merged rating: collected summary + approved customer reviews */
  summary: Rating | null
  /** written reviews per star level (5 → 1); the collected rating summary has no per-star counts */
  breakdown: { stars: number; count: number }[]
}

export interface SubmitReviewInput {
  productId: string
  rating: number
  authorName: string
  title?: string
  content: string
}
