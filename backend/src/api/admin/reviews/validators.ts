import { z } from "@medusajs/framework/zod"

/** Bulk create, used to import collected reviews (keeps their original author, date and location). */
export const AdminPostReviews = z.object({
  reviews: z
    .array(
      z.object({
        product_id: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        author_name: z.string().trim().min(1).max(80),
        location: z.string().trim().max(120).optional(),
        title: z.string().trim().max(120).optional(),
        content: z.string().trim().min(1).max(4000),
        source: z.enum(["collected", "customer"]).default("collected"),
        status: z.enum(["approved", "pending", "rejected"]).default("approved"),
        published_at: z.coerce.date(),
      }),
    )
    .min(1)
    .max(200),
})

export type AdminPostReviewsType = z.infer<typeof AdminPostReviews>
