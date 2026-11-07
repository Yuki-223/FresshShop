"use client"

import Image from "next/image"
import { useState } from "react"
import { useAddToCart } from "@/components/product/product-actions"
import { useI18n } from "@/i18n/client"
import { Link } from "@/i18n/navigation"
import { defaultVariant, toCartLine } from "@/lib/product"
import { useCart } from "@/lib/store/cart"
import type { Product } from "@/types"

/**
 * Product card of vitacost.com collection pages (measured at 1440px): no border, square image,
 * then vendor (12px), two-line title (12px/18px), green stars + review count (13px),
 * price (16px) and a full-width 36px "Add to cart" button (radius 4, 15px, letter-spacing 1px).
 * The button adds the default variant as a one-time purchase, like the homepage "+".
 */
export function CollectionCard({ product }: { product: Product }) {
  const { t, fmt } = useI18n()
  const addToCart = useAddToCart()
  const busy = useCart((s) => s.pending)
  const [adding, setAdding] = useState(false)
  const variant = defaultVariant(product)
  const href = `/product/${product.slug}`
  const rating = product.rating
  const multiPrice = new Set(product.variants.map((v) => v.price)).size > 1

  return (
    <article className="flex flex-col bg-white">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="group relative block aspect-square overflow-hidden bg-white">
        {product.image && (
          <Image
            src={product.image}
            alt=""
            fill
            sizes="245px"
            unoptimized={/^https?:/.test(product.image)}
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col px-2.5 pt-[26px]">
        <p className="truncate text-xs leading-[17px] text-[#121212]">{product.productLine ?? "Metagenics"}</p>
        <Link href={href} className="mb-1 line-clamp-2 min-h-9 text-xs leading-[18px] text-[#121212] hover:underline">
          {product.title}
        </Link>
        <div className="flex h-[23px] items-center gap-1.5">
          {rating && rating.value > 0 && (
            <>
              <span className="relative text-base leading-none tracking-[2px]" role="img" aria-label={t("product.ratedOutOf", { value: rating.value.toFixed(1) })}>
                <span className="text-[#dddddd]" aria-hidden="true">
                  ★★★★★
                </span>
                <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-brand" style={{ width: `${(rating.value / 5) * 100}%` }} aria-hidden="true">
                  ★★★★★
                </span>
              </span>
              <span className="text-[13px] tracking-[0.6px] text-black">{rating.count}</span>
            </>
          )}
        </div>
        {/* lowest price, like the catalog's price sort and filter ("From" when sizes differ) */}
        <p className="mt-2.5 mb-1 text-base leading-[23px] text-black">
          {multiPrice && <span className="mr-1 text-xs text-[#6b6b6b]">{t("product.from")}</span>}
          {fmt.price(product.price)}
        </p>
        <button
          type="button"
          disabled={!variant.available || busy || adding}
          onClick={async () => {
            setAdding(true)
            try {
              await addToCart(toCartLine(product, variant, { type: "once" }))
            } finally {
              setAdding(false)
            }
          }}
          className="mt-auto h-9 w-full rounded border border-brand bg-brand p-2 text-[15px] leading-[18px] tracking-[1px] text-white transition-colors hover:border-brand-dark hover:bg-brand-dark disabled:cursor-not-allowed disabled:border-[#c8c8c8] disabled:bg-[#c8c8c8]"
        >
          {!variant.available ? t("product.outOfStock") : adding ? `${t("common.loading")}…` : t("product.addToCart")}
        </button>
      </div>
    </article>
  )
}
