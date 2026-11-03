import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"
import type { StorePostPurchaseItemType } from "./validators"

type SubscriptionOffer = { months: number; price: number; savePercent: number }

/**
 * POST /store/carts/:id/purchase-items
 * Adds a variant either as a one-time purchase (regular price) or as a subscription.
 * The subscription price is looked up on the server from the variant's metadata —
 * the client only says which interval it wants, never the price.
 */
export async function POST(req: MedusaRequest<StorePostPurchaseItemType>, res: MedusaResponse) {
  const { variant_id, quantity, purchase } = req.validatedBody
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [variant],
  } = await query.graph({
    entity: "product_variant",
    fields: ["id", "metadata", "product.status", "prices.amount", "prices.currency_code"],
    filters: { id: variant_id },
  })
  if (!variant || variant.product?.status !== "published") throw new MedusaError(MedusaError.Types.NOT_FOUND, "Variant not found")

  // `prices` comes from the variant ↔ price set link, which the generated query types don't include
  const prices = (variant as unknown as { prices?: { amount: number; currency_code: string }[] }).prices ?? []
  const listPrice = prices.find((p) => p?.currency_code === "usd")?.amount ?? null
  const metadata: Record<string, unknown> = { purchase: purchase.type, list_price: listPrice }
  let unitPrice: number | undefined
  if (purchase.type === "subscription") {
    const offers = ((variant.metadata?.subscriptions as SubscriptionOffer[] | undefined) ?? []).filter(Boolean)
    const offer = offers.find((o) => o.months === purchase.months)
    if (!offer) throw new MedusaError(MedusaError.Types.INVALID_DATA, `No ${purchase.months}-month subscription for this variant`)
    unitPrice = offer.price
    metadata.months = offer.months
    metadata.save_percent = offer.savePercent
  }

  await addToCartWorkflow(req.scope).run({
    input: {
      cart_id: req.params.id,
      items: [{ variant_id, quantity, metadata, ...(unitPrice !== undefined ? { unit_price: unitPrice } : {}) }],
    },
  })
  res.status(201).json({ ok: true })
}
