import { z } from "@medusajs/framework/zod"

const productId = z.string().min(1).max(64)

/** One product (a product page was opened) or a guest's whole history being merged in. */
export const StorePostBrowsingHistory = z.object({
  items: z
    .array(z.object({ product_id: productId, viewed_at: z.coerce.date().optional() }))
    .min(1)
    .max(100),
})

export type StorePostBrowsingHistoryType = z.infer<typeof StorePostBrowsingHistory>

export const StoreGetBrowsingHistory = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(100),
  offset: z.coerce.number().int().min(0).default(0),
})

export type StoreGetBrowsingHistoryType = z.infer<typeof StoreGetBrowsingHistory>
