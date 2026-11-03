import { ChevronRight } from "lucide-react"
import { ButtonLink } from "@/components/common/button-link"
import { PlaceholderImage } from "@/components/common/placeholder-image"
import { DiscountBadge, Price } from "@/components/product/price"
import { WishlistButton } from "@/components/product/product-actions"
import { Rating } from "@/components/product/rating"
import { Link } from "@/i18n/navigation"
import { getI18n } from "@/i18n/server"
import type { Product } from "@/types"

export function SpecList({ rows, className }: { rows: [label: string, value: React.ReactNode][]; className?: string }) {
  return (
    <dl className={className ?? "grid grid-cols-[110px_1fr] gap-y-2.5 text-sm"}>
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-ink-muted">{label}</dt>
          <dd className="text-brand">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Horizontal product row used by the category page "List view". */
export async function ProductListItem({ product }: { product: Product }) {
  const { t } = await getI18n()
  const href = `/product/${product.slug}`
  return (
    <article className="grid grid-cols-[270px_1fr_auto] overflow-hidden rounded-xl border border-line bg-card transition-shadow hover:shadow-md">
      <Link href={href} tabIndex={-1} aria-hidden>
        <PlaceholderImage className="h-full min-h-[280px] rounded-none">
          <DiscountBadge price={product.price} oldPrice={product.oldPrice} className="absolute top-4 left-4" />
        </PlaceholderImage>
      </Link>
      <div className="px-8 py-8">
        <h3 className="text-lg font-medium text-ink">
          <Link href={href} className="hover:text-brand">
            {product.title}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-ink-soft">{product.description}</p>
        <Rating value={product.rating} size="md" className="mt-3" />
        <SpecList
          className="mt-6 grid grid-cols-[110px_1fr] gap-y-3 text-sm"
          rows={[
            [t("product.freshness"), <>{t("product.freshnessNew")} <span className="text-ink-muted">{t("product.extraFresh")}</span></>],
            [t("product.farm"), <span key="f" className="text-ink-soft">{product.farm}</span>],
            [t("product.delivery"), <span key="d" className="text-ink-soft">{product.deliveryArea}</span>],
            [t("product.stock"), product.stock > 0 ? t("product.stockPcs", { count: product.stock }) : t("product.outOfStock")],
          ]}
        />
      </div>
      <div className="flex w-[200px] flex-col py-8 pr-6">
        <Price price={product.price} oldPrice={product.oldPrice} />
        <div className="mt-4 text-xs">
          <p className="font-heading font-semibold text-ink-muted">{product.freeShipping ? t("product.freeShipping") : t("product.paidShipping")}</p>
          <p className="text-ink-muted">{t.plural("product.deliveryIn", product.deliveryDays)}</p>
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
