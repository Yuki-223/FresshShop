"use client"

import { useState } from "react"
import { Price } from "@/components/product/price"
import { AddToCartButton, CompareButton, WishlistButton } from "@/components/product/product-actions"
import { QuantityUnitSelector } from "@/components/product/quantity-unit-selector"
import type { ProductSnapshot, Unit } from "@/types"

/** Price box + quantity/unit + add to cart, with wish list / compare below. */
export function PurchasePanel({ product, inStock }: { product: ProductSnapshot; inStock: boolean }) {
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState<Unit>(product.units[0])

  return (
    <div>
      <div className="flex items-center justify-between gap-4 rounded-xl border border-surface-2 p-4">
        <Price price={product.price * quantity} oldPrice={product.oldPrice ? product.oldPrice * quantity : undefined} size="lg" tone="brand" />
        <div className="flex items-center gap-4">
          <QuantityUnitSelector
            quantity={quantity}
            unit={unit}
            units={product.units}
            onQuantityChange={setQuantity}
            onUnitChange={setUnit}
          />
          <AddToCartButton product={product} quantity={quantity} unit={unit} disabled={!inStock} />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <WishlistButton productId={product.productId} label="Add to my wish list" variant="ghost" />
        <CompareButton productId={product.productId} />
      </div>
    </div>
  )
}
