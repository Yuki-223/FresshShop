import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/common/breadcrumbs"
import { SoftBadge } from "@/components/common/pills"
import { SectionHeader } from "@/components/common/section-header"
import { ProductImage } from "@/components/product/product-image"
import { SaveBadge } from "@/components/product/price"
import { ProductGrid } from "@/components/product/product-card"
import { ProductTabs } from "@/components/product/product-tabs"
import { PurchasePanel } from "@/components/product/purchase-panel"
import { Rating } from "@/components/product/rating"
import { Link } from "@/i18n/navigation"
import { getI18n } from "@/i18n/server"
import { getProductBySlug, getProductReviews, getRelatedProducts, listCategories, toListing } from "@/lib/api"
import type { Product } from "@/types"

export async function generateMetadata({ params }: PageProps<"/[lang]/product/[slug]">): Promise<Metadata> {
  const { locale } = await getI18n()
  const product = await getProductBySlug((await params).slug, locale)
  return { title: product?.title, description: product?.description }
}

function SpecGrid({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-3 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-ink-muted">{k}:</dt>
          <dd className="text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export default async function ProductPage({ params }: PageProps<"/[lang]/product/[slug]">) {
  const { t, locale } = await getI18n()
  const product = await getProductBySlug((await params).slug, locale)
  if (!product) notFound()
  const [related, groups, reviews] = await Promise.all([getRelatedProducts(product, locale), listCategories(locale), getProductReviews(product)])
  // backend summary = collected rating + approved customer reviews
  const rating = reviews.summary ?? product.rating
  const firstCat = product.healthCategories[0]
  const group = groups.find((g) => g.subcategories.some((s) => s.value === firstCat?.value))
  // the purchase panel only needs listing data, not the long content
  const panelProduct: Product = toListing(product)

  const rows: [string, React.ReactNode][] = [
    [t("productPage.sku"), product.variants.map((v) => v.sku).join(", ")],
    [t("productPage.form"), product.formLabel],
    [
      t("productPage.healthNeeds"),
      <span key="h" className="flex flex-wrap gap-x-2">
        {product.healthCategories.map((c) => {
          const g = groups.find((x) => x.subcategories.some((s) => s.value === c.value))
          return (
            <Link key={c.value} href={`/category/${g?.slug ?? "all"}?sub=${encodeURIComponent(c.value)}`} className="underline hover:text-brand">
              {c.label}
            </Link>
          )
        })}
      </span>,
    ],
    [
      t("productPage.availability"),
      <span key="a" className={product.available ? "text-brand" : "text-hot"}>
        {product.available ? t("productPage.inStock") : t("product.outOfStock")}
      </span>,
    ],
  ]
  if (product.productLine) rows.splice(1, 0, [t("productPage.productLine"), product.productLine])
  if (product.supplementFacts?.servingSize) rows.push([t("productPage.servingSize"), product.supplementFacts.servingSize])

  return (
    <div className="container-page">
      <Breadcrumbs
        items={[
          ...(group ? [{ label: group.name, href: `/category/${group.slug}` }] : []),
          ...(firstCat && group ? [{ label: firstCat.label, href: `/category/${group.slug}?sub=${encodeURIComponent(firstCat.value)}` }] : []),
          { label: product.title },
        ]}
      />

      <div className="mt-4 grid grid-cols-2 gap-8">
        <div>
          <div className="sticky top-6">
            <ProductImage src={product.image} alt={product.title} className="aspect-square" sizes="640px" priority>
              <div className="absolute top-6 left-6 flex gap-3">
                <SaveBadge percent={product.maxSave} />
                {product.isBundle && <SoftBadge>{t("catalog.bundle")}</SoftBadge>}
              </div>
            </ProductImage>
          </div>
        </div>

        <div>
          <h1 className="text-[32px] leading-tight font-semibold text-ink">{product.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            {rating ? (
              <>
                <Rating value={rating.value} tone="gold" size="md" />
                <a href="#reviews" className="text-xs text-ink-muted underline">
                  {rating.value.toFixed(1)} {t.plural("productPage.customerReviews", rating.count)}
                </a>
              </>
            ) : (
              <span className="text-xs text-ink-muted">{t("product.noRating")}</span>
            )}
          </div>
          {product.description && <p className="mt-6 font-heading text-[15px] font-medium text-ink">{product.description}</p>}
          {product.summary && product.summary !== product.description && <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{product.summary}</p>}

          <div className="mt-8">
            <SpecGrid rows={rows} />
          </div>

          <div className="mt-8">
            <PurchasePanel product={panelProduct} />
          </div>

          <div id="reviews">
            <ProductTabs product={product} reviews={reviews} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <SectionHeader
            title={t("productPage.relatedProducts")}
            href={group ? `/category/${group.slug}` : "/category/all"}
            linkLabel={t("productPage.moreProducts")}
          />
          <ProductGrid products={related} columns={4} />
        </section>
      )}
    </div>
  )
}
