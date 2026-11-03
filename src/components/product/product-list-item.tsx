import { ChevronRight } from "lucide-react"
import { ButtonLink } from "@/components/common/button-link"
import { ProductImage } from "@/components/product/product-image"
import { Price, SaveBadge } from "@/components/product/price"
import { WishlistButton } from "@/components/product/product-actions"
import { Rating } from "@/components/product/rating"
import { Link } from "@/i18n/navigation"
import { getI18n } from "@/i18n/server"
import { defaultVariant } from "@/lib/product"
import type { Product } from "@/types"

export function SpecList({ rows, className }: { rows: [label: string, value: React.ReactNode][]; className?: string }) {
  return (
    <dl className={className ?? "grid grid-cols-[110px_1fr] gap-y-2.5 text-sm"}>
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-ink-muted">{label}</dt>
          <dd className="text-ink-soft">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Horizontal product row used by the category page "List view". */
export async function ProductListItem({ product }: { product: Product }) {
  const { t, fmt } = await getI18n()
  const href = `/product/${product.slug}`
  const variant = defaultVariant(product)
  const bestSub = [...variant.subscriptions].sort((a, b) => a.price - b.price)[0]
  const rows: [string, React.ReactNode][] = [
    [t("product.form"), product.formLabel],
    [t("product.sizes"), product.variants.map((v) => v.label).join(" / ")],
    [t("product.healthNeeds"), <span key="h" className="text-brand">{product.healthCategories.slice(0, 3).map((c) => c.label).join(", ")}</span>],
  ]
  if (product.productLine) rows.splice(1, 0, [t("product.productLine"), product.productLine])
  return (
    <article className="grid grid-cols-[270px_1fr_auto] overflow-hidden rounded-xl border border-line bg-card transition-shadow hover:shadow-md">
      <Link href={href} tabIndex={-1} aria-hidden>
        <ProductImage src={product.image} alt={product.title} className="h-full min-h-[280px] rounded-none" sizes="270px">
          <SaveBadge percent={product.maxSave} className="absolute top-4 left-4" />
        </ProductImage>
      </Link>
      <div className="min-w-0 px-8 py-8">
        <h3 className="text-lg font-medium text-ink">
          <Link href={href} className="hover:text-brand">
            {product.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{product.description}</p>
        {product.rating ? (
          <Rating value={product.rating.value} count={product.rating.count} size="md" className="mt-3" />
        ) : (
          <p className="mt-3 text-xs text-ink-muted">{t("product.noRating")}</p>
        )}
        <SpecList className="mt-6 grid grid-cols-[110px_1fr] gap-y-3 text-sm" rows={rows} />
      </div>
      <div className="flex w-[220px] flex-col py-8 pr-6">
        <Price price={variant.price} />
        <div className="mt-4 text-xs">
          {bestSub && bestSub.price < variant.price && (
            <p className="font-heading font-semibold text-brand">{t("product.orSubscribe", { price: fmt.price(bestSub.price) })}</p>
          )}
          <p className="text-ink-muted">{t("product.freeShippingSub")}</p>
        </div>
        <ButtonLink href={href} className="mt-6">
          {t("product.productDetail")}
          <ChevronRight className="size-4" />
        </ButtonLink>
        <WishlistButton productId={product.id} className="mt-3" />
      </div>
    </article>
  )
}
