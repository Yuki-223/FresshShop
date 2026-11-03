import type { Product, ProductSnapshot } from "@/types"

/** Serializable subset of a product passed to client components / stored in the cart. */
export function toSnapshot(p: Product): ProductSnapshot {
  return {
    productId: p.id,
    slug: p.slug,
    title: p.titleL10n,
    price: p.price,
    oldPrice: p.oldPrice,
    rating: p.rating,
    farm: p.farmL10n,
    freshnessDays: p.freshnessDays,
    units: p.units,
  }
}
