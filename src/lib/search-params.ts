import type { ProductQuery, SortKey } from "@/types"

export type RawSearchParams = Record<string, string | string[] | undefined>

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
]

export type ViewMode = "grid" | "list"

export const PAGE_SIZE = 9

const list = (v: string | string[] | undefined) => (v == null ? [] : Array.isArray(v) ? v : [v])
const first = (v: string | string[] | undefined) => list(v)[0]
const num = (v: string | string[] | undefined) => {
  const n = Number(first(v))
  return Number.isFinite(n) && first(v) !== undefined && first(v) !== "" ? n : undefined
}

/** URL → typed query. URL is the single source of truth for catalog filters. */
export function parseProductQuery(sp: RawSearchParams, category?: string): ProductQuery & { view: ViewMode } {
  const sort = first(sp.sort) as SortKey | undefined
  return {
    category,
    subcategory: first(sp.sub) || undefined,
    q: first(sp.q) || undefined,
    brands: list(sp.brand),
    ratings: list(sp.rating).map(Number).filter(Boolean),
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    discounted: first(sp.discounted) === "1",
    freeShipping: first(sp.shipping) === "1",
    inStock: first(sp.stock) === "1",
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : "popular",
    page: num(sp.page) ?? 1,
    pageSize: Math.min(60, Math.max(PAGE_SIZE, num(sp.per) ?? PAGE_SIZE)),
    view: first(sp.view) === "list" ? "list" : "grid",
  }
}
