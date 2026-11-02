import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/common/breadcrumbs"
import { PlaceholderImage } from "@/components/common/placeholder-image"
import { SoftBadge } from "@/components/common/pills"
import { SectionHeader } from "@/components/common/section-header"
import { DiscountBadge } from "@/components/product/price"
import { ProductGrid } from "@/components/product/product-card"
import { ProductTabs } from "@/components/product/product-tabs"
import { PurchasePanel } from "@/components/product/purchase-panel"
import { Rating } from "@/components/product/rating"
import { findCategory, getProductBySlug, getRelatedProducts, getReviews } from "@/lib/api"
import { toSnapshot } from "@/lib/product"

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug)
  return { title: product?.title ?? "Product", description: product?.longDescription }
}

function SpecGrid({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-3 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-ink-muted">{k}:</dt>
          <dd className="text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const product = await getProductBySlug((await params).slug)
  if (!product) notFound()
  const [category, related, reviews] = await Promise.all([
    findCategory(product.categorySlug),
    getRelatedProducts(product),
    getReviews(product),
  ])
  const inStock = product.stock > 0

  return (
    <div className="container-page">
      <Breadcrumbs
        items={[
          { label: category?.name ?? "Shop", href: `/category/${product.categorySlug}` },
          { label: product.title },
        ]}
      />

      <div className="mt-4 grid grid-cols-2 gap-8">
        <div className="space-y-8">
          {[0, 1, 2].map((i) => (
            <PlaceholderImage key={i} className="aspect-[4/3]" label={i === 0 ? product.title : undefined}>
              {i === 0 && (
                <div className="absolute top-6 left-6 flex gap-3">
                  <DiscountBadge price={product.price} oldPrice={product.oldPrice} />
                  {product.freeShipping && <SoftBadge>Free shipping</SoftBadge>}
                </div>
              )}
            </PlaceholderImage>
          ))}
        </div>

        <div>
          <h1 className="text-[32px] leading-tight font-semibold text-ink">{product.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Rating value={product.rating} tone="gold" size="md" />
            <a href="#reviews" className="text-xs text-ink-muted underline">
              ({product.reviewsCount} customer review{product.reviewsCount === 1 ? "" : "s"})
            </a>
          </div>
          <p className="mt-10 text-[15px] leading-relaxed text-ink">{product.longDescription}</p>

          <div className="mt-10 grid grid-cols-2 gap-8">
            <SpecGrid
              rows={[
                ["SKU", product.sku],
                [
                  "Category",
                  <Link key="c" href={`/category/${product.categorySlug}?sub=${encodeURIComponent(product.subcategory)}`} className="underline hover:text-brand">
                    {product.subcategory}
                  </Link>,
                ],
                ["Stock", <span key="s" className={inStock ? "text-brand underline" : "text-hot"}>{inStock ? "In Stock" : "Out of stock"}</span>],
                ["Farm", product.farm],
              ]}
            />
            <SpecGrid
              rows={[
                ["Freshness", `${product.freshnessDays} day${product.freshnessDays > 1 ? "s" : ""} old`],
                ["Buy by", product.units.join(", ")],
                ["Delivery", `in ${product.deliveryDays} day${product.deliveryDays > 1 ? "s" : ""}`],
                ["Delivery area", product.deliveryArea],
              ]}
            />
          </div>

          <div className="mt-10">
            <PurchasePanel product={toSnapshot(product)} inStock={inStock} />
          </div>

          <div id="reviews">
            <ProductTabs product={product} reviews={reviews} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <SectionHeader title="Related products" href={`/category/${product.categorySlug}`} linkLabel="More products" />
          <ProductGrid products={related} columns={4} />
        </section>
      )}
    </div>
  )
}
