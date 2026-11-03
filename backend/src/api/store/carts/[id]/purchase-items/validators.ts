import { z } from "@medusajs/framework/zod"

export const StorePostPurchaseItem = z.object({
  variant_id: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  purchase: z.discriminatedUnion("type", [
    z.object({ type: z.literal("once") }),
    z.object({ type: z.literal("subscription"), months: z.number().int().min(1).max(12) }),
  ]),
})

export type StorePostPurchaseItemType = z.infer<typeof StorePostPurchaseItem>
