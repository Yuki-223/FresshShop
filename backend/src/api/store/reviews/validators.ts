import { z } from "@medusajs/framework/zod"

export const StorePostReview = z.object({
  product_id: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  author_name: z.string().trim().min(1).max(80),
  title: z.string().trim().max(120).optional(),
  content: z.string().trim().min(2).max(4000),
})

export type StorePostReviewType = z.infer<typeof StorePostReview>
