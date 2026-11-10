import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/common/breadcrumbs"
import { VcCarousel } from "@/components/home/vc-carousel/vc-carousel"
import { ProductDetails } from "@/components/product/product-details"
import { ProductPromo } from "@/components/product/product-promo"
import { ProductReviews } from "@/components/product/product-reviews"
import { ProductHero } from "@/components/product/product-hero"
import { Link } from "@/i18n/navigation"
import { getI18n } from "@/i18n/server"
import { getProductBySlug, getProductReviews, getRelatedProducts, listCategories, toListing } from "@/lib/api"
import type { Product } from "@/types"

// Product data comes from the backend on every request (no static shell to show instantly).
export const instant = false

export async function generateMetadata({ params }: PageProps<"/[lang]/product/[slug]">): Promise<Metadata> {
  const { locale } = await getI18n()
  const product = await getProductBySlug((await params).slug, locale)
  return { title: product?.title, description: product?.description }
}

/**
 * Product page laid out like vitacost.com's (measured at 1440px): breadcrumbs; the title centred
 * (26px regular, 2px dashed rule under it) with a "SKU · form · product line" line; a 585px white
 * image box with a 1px hairline border and a row of thumbnails next to the buy box; then "You Might
 * Also Like" (the homepage shelf), "From the Brand" (the brand's marketing images, our addition),
 * "Details" (everything open) and "Customer Reviews".
 */
export default async function ProductPage({ params }: PageProps<"/[lang]/product/[slug]">) {
  const { t, locale } = await getI18n()
  const product = await getProductBySlug((await params).slug, locale)
  if (!product) notFound()
  const [related, groups, reviews] = await Promise.all([getRelatedProducts(product, locale, 10), listCategories(locale), getProductReviews(product)])
  // backend summary = collected rating + approved customer reviews
  const rating = reviews.summary ?? product.rating ?? null
  const firstCat = product.healthCategories[0]
  const group = groups.find((g) => g.subcategories.some((s) => s.value === firstCat?.value))
  // the purchase panel only needs listing data, not the long content
  const panelProduct: Product = toListing(product)
  // a bundle's collected facts are those of its first product only, so they don't go in "Key info"
  const facts = product.isBundle ? undefined : product.supplementFacts
  const keyInfo = [
    ...(facts?.servingSize ? [{ label: t("productPage.servingSize"), value: facts.servingSize }] : []),
    { label: t("productPage.form"), value: product.formLabel },
    ...(product.productLine ? [{ label: t("productPage.productLine"), value: product.productLine }] : []),
  ]
  const skus = product.variants.map((v) => v.sku).join(", ")

  return (
    <>
      <div className="container-page">
        <Breadcrumbs
          tone="link"
          items={[
            ...(group ? [{ label: group.name, href: `/category/${group.slug}` }] : []),
            ...(firstCat && group ? [{ label: firstCat.label, href: `/category/${group.slug}?sub=${encodeURIComponent(firstCat.value)}` }] : []),
            { label: product.title },
          ]}
        />

        <div className="mt-6 text-center">
          <h1 className="inline-block border-b-2 border-dashed border-[#494949] pb-2.5 font-sans text-[26px] leading-tight font-normal tracking-[0.6px] text-[#121212]">
            {product.title}
          </h1>
          <p className="mt-2 text-[13px] leading-[23px] tracking-[0.6px] text-[#121212]/65">
            <span>
              {t("productPage.sku")} #: {skus}
            </span>
            <span className="mx-2 text-[#121212]/30">|</span>
            <span>{product.formLabel}</span>
            {product.productLine && (
              <>
                <span className="mx-2 text-[#121212]/30">|</span>
                <Link href={`/category/all?brand=${encodeURIComponent(product.productLine)}`} className="text-[#2970b5] hover:underline">
                  {product.productLine}
                </Link>
              </>
            )}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-[585fr_600fr] gap-[50px] px-[25px]">
          <ProductHero
            product={panelProduct}
            gallery={product.gallery}
            variantImages={product.variantImages}
            rating={rating}
            keyInfo={keyInfo}
            servingSize={facts?.servingSize}
            servings={facts?.servings}
          />
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-16">
          <VcCarousel title={t("productPage.youMightAlsoLike")} products={related} />
        </div>
      )}

      <div className="container-page pb-16">
        <div className="px-[25px]">
          <ProductPromo images={product.promo} title={product.title} />
          <ProductDetails product={product} />
          <ProductReviews productId={product.medusaId} sourceUrl={product.sourceUrl} initial={reviews} />
        </div>
      </div>
    </>
  )
}
