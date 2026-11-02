import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { CatalogPagination } from "@/components/catalog/catalog-pagination"
import { AppliedFilters, FilterBar, ViewToggle } from "@/components/catalog/filter-bar"
import { FilterSidebar } from "@/components/catalog/filter-sidebar"
import { Breadcrumbs } from "@/components/common/breadcrumbs"
import { ProductCard } from "@/components/product/product-card"
import { ProductListItem } from "@/components/product/product-list-item"
import { ButtonLink } from "@/components/common/button-link"
import { PRICE_RANGE, findCategory, getFacets, searchProducts } from "@/lib/api"
import { parseProductQuery } from "@/lib/search-params"

async function resolveCategory(slug: string) {
  if (slug === "all") return { slug: "all", name: "All products", subcategories: [] as string[] }
  return findCategory(slug)
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const category = await resolveCategory((await params).slug)
  return { title: category?.name ?? "Category" }
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/category/[slug]">) {
  const { slug } = await params
  const category = await resolveCategory(slug)
  if (!category) notFound()

  const query = parseProductQuery(await searchParams, slug)
  const [result, facets] = await Promise.all([searchProducts(query), getFacets(slug)])
  const title = query.q ? `Results for “${query.q}”` : category.name

  return (
    <div className="container-page">
      <Breadcrumbs items={[{ label: category.name, href: `/category/${slug}` }]} />

      <div className="flex items-center justify-between pt-4">
        <h1 className="text-[32px] font-semibold text-ink">{title}</h1>
        <ViewToggle view={query.view} total={result.total} />
      </div>
      <div className="mt-6">
        <FilterBar counts={facets.toggles} />
        <AppliedFilters />
      </div>

      <div className="mt-16 grid grid-cols-[230px_1fr] gap-8">
        <FilterSidebar
          categorySlug={slug}
          subcategories={facets.subcategories}
          brands={facets.brands}
          priceBounds={PRICE_RANGE}
        />

        <section aria-label="Products">
          {result.items.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-line py-24 text-center">
              <p className="font-heading text-lg font-semibold text-ink">No products match your filters</p>
              <p className="mt-2 text-sm text-ink-muted">Try removing some filters or searching for something else.</p>
              <ButtonLink href={`/category/${slug}`} variant="outline" className="mt-6">
                Reset filters
              </ButtonLink>
            </div>
          ) : query.view === "list" ? (
            <div className="space-y-8">
              {result.items.map((p) => (
                <ProductListItem key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8">
              {result.items.map((p) => (
                <ProductCard key={p.id} product={p} showRating />
              ))}
            </div>
          )}
        </section>
      </div>

      {result.total > 0 && (
        <Suspense>
          <CatalogPagination page={result.page} pageCount={result.pageCount} pageSize={result.pageSize} total={result.total} />
        </Suspense>
      )}
    </div>
  )
}
