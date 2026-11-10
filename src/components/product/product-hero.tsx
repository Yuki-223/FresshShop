"use client"

import { useState } from "react"
import { ProductGallery } from "@/components/product/product-gallery"
import { PurchasePanel } from "@/components/product/purchase-panel"
import { defaultVariant } from "@/lib/product"
import type { Product, Rating } from "@/types"

/**
 * Photos + buy box of the product page. Picking another size / flavour in the buy box shows that
 * one's own photo first in the gallery (e.g. the 180-capsule bottle) when the collection has one;
 * the rest of the gallery (Supplement Facts, directions…) is shared by all sizes.
 */
export function ProductHero({
  product,
  gallery,
  variantImages,
  ...panel
}: {
  product: Product
  /** main photo first, then the neutral photos */
  gallery: string[]
  variantImages: Record<string, string>
  rating: Rating | null
  keyInfo: { label: string; value: string }[]
  servingSize?: string
  servings?: string
}) {
  const [sku, setSku] = useState(() => defaultVariant(product).sku)
  const front = variantImages[sku]
  const images = front ? [front, ...gallery.slice(1)] : gallery

  return (
    <>
      {/* a new size starts the gallery again at its own photo */}
      <ProductGallery key={front ?? "default"} images={images} alt={product.title} />
      <PurchasePanel product={product} onVariantChange={(v) => setSku(v.sku)} {...panel} />
    </>
  )
}
