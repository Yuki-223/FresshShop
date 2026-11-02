import Link from "next/link"
import { PlaceholderImage } from "@/components/common/placeholder-image"
import { DiscountBadge, Price } from "@/components/product/price"
import { BuyNowButton } from "@/components/product/product-actions"
import { Rating } from "@/components/product/rating"
import { toSnapshot } from "@/lib/product"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

/** Grid product card — used on homepage sections, category grid and related products. */
export function ProductCard({
  product,
  showRating = false,
  className,
}: {
  product: Product
  showRating?: boolean
  className?: string
}) {
  const href = `/product/${product.slug}`
  return (
    <article className={cn("group flex flex-col rounded-xl border border-line bg-card p-4 transition-shadow hover:shadow-md", className)}>
      <Link href={href} tabIndex={-1} aria-hidden>
        <PlaceholderImage className="aspect-[237/180]">
          <DiscountBadge price={product.price} oldPrice={product.oldPrice} className="absolute top-4 left-4 bg-transparent" />
        </PlaceholderImage>
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="font-heading text-[15px] font-medium text-ink">
          <Link href={href} className="hover:text-brand">
            {product.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-ink-soft">{product.description}</p>
        {showRating && <Rating value={product.rating} className="mt-2" />}
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <Price price={product.price} oldPrice={product.oldPrice} />
          <BuyNowButton product={toSnapshot(product)} />
        </div>
      </div>
    </article>
  )
}

export function ProductGrid({
  products,
  columns = 3,
  showRating,
}: {
  products: Product[]
  columns?: 3 | 4
  showRating?: boolean
}) {
  return (
    <div className={cn("grid gap-8", columns === 4 ? "grid-cols-4" : "grid-cols-3")}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} showRating={showRating} />
      ))}
    </div>
  )
}
