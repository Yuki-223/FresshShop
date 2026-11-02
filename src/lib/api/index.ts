/**
 * Data access layer. Every page/component reads data through these async
 * functions only, so swapping the in-memory mock for a real backend
 * (REST, GraphQL, a CMS…) means changing this file and nothing else.
 */
import { categories, getCategory } from "@/lib/data/categories"
import { blogPosts, testimonials } from "@/lib/data/content"
import { buildReviews, products } from "@/lib/data/products"
import type { Paginated, Product, ProductQuery } from "@/types"

export const PRICE_RANGE = { min: 0, max: 50 } as const

export async function listCategories() {
  return categories
}

export async function findCategory(slug: string) {
  return getCategory(slug)
}

export async function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug)
}

export async function getProductsByIds(ids: string[]) {
  return products.filter((p) => ids.includes(p.id))
}

export async function getReviews(product: Product) {
  return buildReviews(product)
}

function matches(p: Product, q: ProductQuery) {
  if (q.category && q.category !== "all" && p.categorySlug !== q.category) return false
  if (q.subcategory && p.subcategory !== q.subcategory) return false
  if (q.q) {
    const needle = q.q.toLowerCase()
    const hay = [p.title, p.brand, p.subcategory, ...p.tags].join(" ").toLowerCase()
    if (!hay.includes(needle)) return false
  }
  if (q.brands?.length && !q.brands.includes(p.brand)) return false
  if (q.ratings?.length && !q.ratings.includes(p.rating)) return false
  if (q.minPrice != null && p.price < q.minPrice) return false
  if (q.maxPrice != null && p.price > q.maxPrice) return false
  if (q.discounted && !p.oldPrice) return false
  if (q.freeShipping && !p.freeShipping) return false
  if (q.inStock && p.stock <= 0) return false
  return true
}

const sorters: Record<NonNullable<ProductQuery["sort"]>, (a: Product, b: Product) => number> = {
  popular: (a, b) => b.reviewsCount - a.reviewsCount,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
}

export async function searchProducts(query: ProductQuery): Promise<Paginated<Product>> {
  const pageSize = query.pageSize ?? 9
  const filtered = products.filter((p) => matches(p, query)).sort(sorters[query.sort ?? "popular"])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const page = Math.min(Math.max(1, query.page ?? 1), pageCount)
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    page,
    pageSize,
    pageCount,
  }
}

/** Facet counts for the sidebar, computed on the category scope only. */
export async function getFacets(category?: string) {
  const scope = products.filter((p) => matches(p, { category }))
  const brandMap = new Map<string, number>()
  const subMap = new Map<string, number>()
  for (const p of scope) {
    brandMap.set(p.brand, (brandMap.get(p.brand) ?? 0) + 1)
    subMap.set(p.subcategory, (subMap.get(p.subcategory) ?? 0) + 1)
  }
  return {
    brands: [...brandMap].map(([value, count]) => ({ value, count })).sort((a, b) => a.value.localeCompare(b.value)),
    subcategories: [...subMap].map(([value, count]) => ({ value, count })),
    toggles: {
      stock: scope.filter((p) => p.stock > 0).length,
      discounted: scope.filter((p) => p.oldPrice).length,
      shipping: scope.filter((p) => p.freeShipping).length,
    },
    total: scope.length,
  }
}

export async function getBestSelling(limit = 3) {
  return [...products].sort(sorters.popular).slice(0, limit)
}

export async function getBestFromFarmers(limit = 3) {
  return products.filter((p) => p.categorySlug === "fruit-and-vegetables" || p.categorySlug === "meat-and-fish").slice(0, limit)
}

export async function getFeatured(limit = 4) {
  return products.filter((p) => p.oldPrice).slice(0, limit)
}

export async function getRelatedProducts(product: Product, limit = 4) {
  return products.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, limit)
}

export async function listTestimonials() {
  return testimonials
}

export async function listBlogPosts({ tag, page = 1, pageSize = 6 }: { tag?: string; page?: number; pageSize?: number } = {}) {
  const filtered = tag ? blogPosts.filter((p) => p.tag === tag) : blogPosts
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(Math.max(1, page), pageCount)
  return {
    items: filtered.slice((current - 1) * pageSize, current * pageSize),
    total: filtered.length,
    page: current,
    pageSize,
    pageCount,
  }
}

export async function getBlogPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug)
}

export async function listBlogTags() {
  const map = new Map<string, number>()
  for (const p of blogPosts) map.set(p.tag, (map.get(p.tag) ?? 0) + 1)
  return [...map].map(([value, count]) => ({ value, count }))
}
