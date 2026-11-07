import { z } from "@medusajs/framework/zod"

export const StorePostCustomerPassword = z.object({
  old_password: z.string().min(1),
  new_password: z.string().min(8).max(128),
})

export type StorePostCustomerPasswordType = z.infer<typeof StorePostCustomerPassword>
