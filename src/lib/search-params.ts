import type { MessageKey } from "@/i18n/dictionary"
import type { ProductQuery, SortKey } from "@/types"

export type RawSearchParams = Record<string, string | string[] | undefined>

export const SORT_OPTIONS: { value: SortKey; label: MessageKey }[] = [
  { value: "popular", label: "catalog.sortPopular" },
  { value: "rating", label: "catalog.sortRating" },
  { value: "name", label: "catalog.sortName" },
  { value: "price-asc", label: "catalog.sortPriceAsc" },
  { value: "price-desc", label: "catalog.sortPriceDesc" },
]

export type ViewMode = "grid" | "list"

/** 4 columns × 6 rows, as on vitacost.com collection pages */
export const PAGE_SIZE = 24

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
    forms: list(sp.form),
    subscribe: first(sp.subscribe) === "1",
    bundle: first(sp.bundle) === "1",
    inStock: first(sp.stock) === "1",
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : "popular",
    page: num(sp.page) ?? 1,
    pageSize: Math.min(60, Math.max(PAGE_SIZE, num(sp.per) ?? PAGE_SIZE)),
    view: first(sp.view) === "list" ? "list" : "grid",
  }
}
