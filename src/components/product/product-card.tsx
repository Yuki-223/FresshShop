import { ProductImage } from "@/components/product/product-image"
import { Price, SaveBadge } from "@/components/product/price"
import { BuyNowButton } from "@/components/product/product-actions"
import { Rating } from "@/components/product/rating"
import { Link } from "@/i18n/navigation"
import { defaultVariant, toCartLine } from "@/lib/product"
import { cn } from "@/lib/utils"
import type { Product } from "@/types"

/** Grid product card — used on homepage sections, category grid and related products. */
export function ProductCard({ product, className }: { product: Product; className?: string; showRating?: boolean }) {
  const href = `/product/${product.slug}`
  const variant = defaultVariant(product)
  const varies = new Set(product.variants.map((v) => v.price)).size > 1
  return (
    <article className={cn("group flex flex-col rounded-xl border border-line bg-card p-4 transition-shadow hover:shadow-md", className)}>
      <Link href={href} tabIndex={-1} aria-hidden>
        <ProductImage src={product.image} alt={product.title} className="aspect-[237/180]" sizes="(min-width: 1440px) 300px, 25vw">
          <SaveBadge percent={product.maxSave} className="absolute top-4 left-4" />
        </ProductImage>
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="font-heading text-[15px] font-medium text-ink">
          <Link href={href} className="hover:text-brand">
            {product.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{product.description}</p>
        {product.rating && <Rating value={product.rating.value} count={product.rating.count} className="mt-2" />}
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <Price price={product.price} from={varies} />
          <BuyNowButton line={toCartLine(product, variant)} disabled={!variant.available} />
        </div>
      </div>
    </article>
  )
}

export function ProductGrid({ products, columns = 3 }: { products: Product[]; columns?: 3 | 4 }) {
  return (
    <div className={cn("grid gap-8", columns === 4 ? "grid-cols-4" : "grid-cols-3")}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
