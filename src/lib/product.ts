import type { CartLineInput, PurchaseMode, Product, Variant } from "@/types"

export function defaultVariant(p: Pick<Product, "variants">): Variant {
  return p.variants.find((v) => v.available) ?? p.variants[0]
}

export function priceFor(variant: Variant, purchase: PurchaseMode) {
  if (purchase.type === "once") return variant.price
  return variant.subscriptions.find((s) => s.months === purchase.months)?.price ?? variant.price
}

/** Serializable cart line for a product/variant/purchase mode (passed to client components). */
export function toCartLine(p: Product, variant: Variant = defaultVariant(p), purchase: PurchaseMode = { type: "once" }): CartLineInput {
  return {
    productId: p.id,
    slug: p.slug,
    title: p.titleL10n,
    image: p.image,
    sku: variant.sku,
    variantLabel: variant.label,
    price: priceFor(variant, purchase),
    listPrice: variant.price,
    purchase,
  }
}

export const lineIdOf = (sku: string, purchase: PurchaseMode) => `${sku}|${purchase.type === "once" ? "once" : `sub${purchase.months}`}`
