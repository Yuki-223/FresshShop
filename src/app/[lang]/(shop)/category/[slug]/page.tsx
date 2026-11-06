import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { AppliedFilters } from "@/components/catalog/filter-bar"
import { ButtonLink } from "@/components/common/button-link"
import { CollectionBanner } from "@/components/collection/collection-banner"
import { CollectionCard } from "@/components/collection/collection-card"
import { CollectionPagination } from "@/components/collection/collection-pagination"
import { CollectionSidebar } from "@/components/collection/collection-sidebar"
import { RevealGrid } from "@/components/collection/reveal-grid"
import { CollectionToolbar } from "@/components/collection/collection-toolbar"
import { getI18n } from "@/i18n/server"
import { findCategory, getFacets, priceRange, searchProducts } from "@/lib/api"
import { collectionBanner } from "@/lib/data/metagenics/collection-banners"
import { parseProductQuery } from "@/lib/search-params"

// Product data comes from the backend on every request (no static shell to show instantly).
export const instant = false

async function resolveCategory(slug: string) {
  const { t, locale } = await getI18n()
  if (slug === "all") return { slug: "all", name: t("catalog.allProducts"), subcategories: [] }
  return findCategory(slug, locale)
}

export async function generateMetadata({ params }: PageProps<"/[lang]/category/[slug]">): Promise<Metadata> {
  const category = await resolveCategory((await params).slug)
  return { title: category?.name }
}

/**
 * Every product-list page (categories, product lines, forms, deals, search results) laid out like
 * a vitacost.com collection page: banner, collapsible filter sidebar, in-collection search,
 * count + sort, 4-column grid with full-width "Add to cart" buttons, centred page numbers.
 * Filtering is unchanged: the URL is the single source of truth (lib/search-params.ts).
 */
export default async function CategoryPage({ params, searchParams }: PageProps<"/[lang]/category/[slug]">) {
  const { t, locale } = await getI18n()
  const { slug } = await params
  const category = await resolveCategory(slug)
  if (!category) notFound()

  const query = parseProductQuery(await searchParams, slug)
  const [result, facets, bounds] = await Promise.all([searchProducts(query, locale), getFacets(slug, locale), priceRange(locale)])
  const sub = query.subcategory ? facets.subcategories.find((s) => s.value === query.subcategory)?.label : undefined
  const brand = query.brands?.length === 1 ? query.brands[0] : undefined
  const title = query.q ? t("catalog.resultsFor", { q: query.q }) : (brand ?? sub ?? category.name)
  const subtitle = !query.q && (brand || sub) ? category.name : undefined
  // identifies this exact list (category + filters + sort + page): a new one starts again at 8 cards
  const pageKey = `${locale}:${slug}:${JSON.stringify(query)}`
  const labels = Object.fromEntries([...facets.brands, ...facets.subcategories, ...facets.forms].map((f) => [f.value, f.label]))

  return (
    <div className="container-page pt-[30px]">
      <CollectionBanner title={title} subtitle={subtitle} banner={collectionBanner(slug, query.subcategory)} />

      <div className="mt-10 grid grid-cols-[272px_1fr] px-[42px]">
        <div className="pl-3.5">
          <Suspense>
            <CollectionSidebar
              categorySlug={slug}
              subcategories={facets.subcategories}
              brands={facets.brands}
              forms={facets.forms}
              ratings={facets.ratings}
              toggles={facets.toggles}
              priceBounds={bounds}
            />
          </Suspense>
        </div>

        <section aria-label={t("catalog.productsLabel")}>
          <Suspense>
            <CollectionToolbar total={result.total} />
            <AppliedFilters labels={labels} />
          </Suspense>

          {result.items.length === 0 ? (
            <div className="mt-8 flex flex-col items-center border border-dashed border-[#d9d9d9] py-24 text-center">
              <p className="text-lg font-bold text-[#121212]">{t("catalog.noResultsTitle")}</p>
              <p className="mt-2 text-sm text-[#6b6b6b]">{t("catalog.noResultsBody")}</p>
              <ButtonLink href={`/category/${slug}`} variant="outline" className="mt-6">
                {t("catalog.resetFilters")}
              </ButtonLink>
            </div>
          ) : (
            // a row at a time (8, then 4 by 4 up to the page's 24); the page numbers follow the last row
            <RevealGrid
              key={pageKey}
              storageKey={pageKey}
              footer={
                <div className="mt-8">
                  <Suspense>
                    <CollectionPagination page={result.page} pageCount={result.pageCount} />
                  </Suspense>
                </div>
              }
            >
              {result.items.map((p) => (
                <CollectionCard key={p.id} product={p} />
              ))}
            </RevealGrid>
          )}
        </section>
      </div>
    </div>
  )
}
