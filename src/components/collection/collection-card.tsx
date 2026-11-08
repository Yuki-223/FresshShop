"use client"

import Image from "next/image"
import { useState } from "react"
import { useAddToCart } from "@/components/product/product-actions"
import { useI18n } from "@/i18n/client"
import { Link } from "@/i18n/navigation"
import { defaultVariant, toCartLine } from "@/lib/product"
import { useCart } from "@/lib/store/cart"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

/** Green stars + review count (13px), as on the cards. */
function RatingLine({ product }: { product: Product }) {
  const { t } = useI18n()
  const rating = product.rating
  return (
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
  )
}

/** Lowest price, like the catalog's price sort and filter ("From" when sizes differ). */
function Price({ product, className }: { product: Product; className: string }) {
  const { t, fmt } = useI18n()
  const multiPrice = new Set(product.variants.map((v) => v.price)).size > 1
  return (
    <p className={className}>
      {multiPrice && <span className="mr-1 text-xs text-[#6b6b6b]">{t("product.from")}</span>}
      {fmt.price(product.price)}
    </p>
  )
}

/** Full-width 36px "Add to cart": adds the default variant as a one-time purchase, like the homepage "+". */
function AddButton({ product, className }: { product: Product; className?: string }) {
  const { t } = useI18n()
  const addToCart = useAddToCart()
  const busy = useCart((s) => s.pending)
  const [adding, setAdding] = useState(false)
  const variant = defaultVariant(product)
  return (
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
      className={cn(
        "h-9 w-full rounded border border-brand bg-brand p-2 text-[15px] leading-[18px] tracking-[1px] text-white transition-colors hover:border-brand-dark hover:bg-brand-dark disabled:cursor-not-allowed disabled:border-[#c8c8c8] disabled:bg-[#c8c8c8]",
        className,
      )}
    >
      {!variant.available ? t("product.outOfStock") : adding ? `${t("common.loading")}…` : t("product.addToCart")}
    </button>
  )
}

function ProductImage({ product, href, sizes, className }: { product: Product; href: string; sizes: string; className: string }) {
  return (
    <Link href={href} tabIndex={-1} aria-hidden="true" className={cn("group relative block overflow-hidden bg-white", className)}>
      {product.image && (
        <Image
          src={product.image}
          alt=""
          fill
          sizes={sizes}
          unoptimized={/^https?:/.test(product.image)}
          className="object-contain transition-transform duration-300 group-hover:scale-105"
        />
      )}
    </Link>
  )
}

/**
 * Product card of vitacost.com collection pages (measured at 1440px): no border, square image,
 * then vendor (12px), two-line title (12px/18px), green stars + review count (13px),
 * price (16px) and a full-width 36px "Add to cart" button (radius 4, 15px, letter-spacing 1px).
 * The button adds the default variant as a one-time purchase, like the homepage "+".
 */
export function CollectionCard({ product }: { product: Product }) {
  const href = `/product/${product.slug}`
  return (
    <article className="flex flex-col bg-white">
      <ProductImage product={product} href={href} sizes="245px" className="aspect-square" />
      <div className="flex flex-1 flex-col px-2.5 pt-[26px]">
        <p className="truncate text-xs leading-[17px] text-[#121212]">{product.productLine ?? "Metagenics"}</p>
        <Link href={href} className="mb-1 line-clamp-2 min-h-9 text-xs leading-[18px] text-[#121212] hover:underline">
          {product.title}
        </Link>
        <RatingLine product={product} />
        <Price product={product} className="mt-2.5 mb-1 text-base leading-[23px] text-black" />
        <AddButton product={product} className="mt-auto" />
      </div>
    </article>
  )
}

/**
 * The same product as one row of the list view (our addition, Vitacost has no list view):
 * 170px image | line, title (16px semibold), stars, a two-line summary and "form | sizes" |
 * price (20px), the best subscription saving and the same "Add to cart" button.
 */
export function CollectionRow({ product }: { product: Product }) {
  const { t } = useI18n()
  const href = `/product/${product.slug}`
  const sizes = [...new Set(product.variants.map((v) => v.label))].filter((l) => l && l !== "Bundle")
  return (
    <article className="grid grid-cols-[170px_1fr_210px] items-start gap-8 border-b border-[#e5e5e5] bg-white py-[22px]">
      <ProductImage product={product} href={href} sizes="170px" className="size-[170px]" />
      <div className="min-w-0 pt-1">
        <p className="truncate text-xs leading-[17px] text-[#121212]">{product.productLine ?? "Metagenics"}</p>
        <Link href={href} className="mt-0.5 block text-base leading-[22px] font-semibold text-[#121212] hover:underline">
          {product.title}
        </Link>
        <div className="mt-1">
          <RatingLine product={product} />
        </div>
        {(product.summary || product.description) && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-[19px] text-[#121212]/70">{product.summary || product.description}</p>
        )}
        <p className="mt-2 text-xs text-[#6b6b6b]">
          {product.formLabel}
          {sizes.length > 0 && <> &nbsp;|&nbsp; {sizes.join(" · ")}</>}
        </p>
      </div>
      <div className="pt-1">
        <Price product={product} className="text-xl leading-[26px] text-black" />
        {product.maxSave > 0 && <p className="mt-1 text-xs text-brand">{t("collection.saveUpTo", { percent: product.maxSave })}</p>}
        <AddButton product={product} className="mt-3.5" />
      </div>
    </article>
  )
}
