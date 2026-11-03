/**
 * Data access layer. Every page/component reads data through these async
 * functions only, so swapping the in-memory mock for a real backend
 * (REST, GraphQL, a CMS…) means changing this file and nothing else.
 *
 * All functions take the locale and return already-localized view objects;
 * stable keys (slugs, subcategory/brand/tag values) never change between languages.
 */
import { localeConfig, type Locale } from "@/i18n/config"
import { brandRecords, categoryRecords, productTagRecords } from "@/lib/data/categories"
import {
  blogArticle,
  blogRecords,
  blogTagLabels,
  deliveryAreaLabels,
  nutritionRecords,
  questionRecords,
  testimonialRecords,
} from "@/lib/data/content"
import { infoPages } from "@/lib/data/pages"
import { productRecords, reviewTexts, rng, type ProductRecord } from "@/lib/data/products"
import type { BlogPost, Category, Option, Paginated, Product, ProductQuery, Review } from "@/types"

/** Price slider bounds in base currency (USD); the UI converts them to the display currency. */
export const PRICE_RANGE_BASE = { min: 0, max: 50 } as const

export function priceRange(locale: Locale) {
  const rate = localeConfig[locale].rate
  return { min: 0, max: Math.ceil(PRICE_RANGE_BASE.max * rate) }
}

const brandLabel = (key: string, locale: Locale) => brandRecords.find((b) => b.key === key)?.label[locale] ?? key

function localizeCategory(slug: string, locale: Locale): Category | undefined {
  const c = categoryRecords.find((r) => r.slug === slug)
  if (!c) return undefined
  return { slug: c.slug, name: c.name[locale], subcategories: c.subcategories.map((s) => ({ value: s.value, label: s.label[locale] })) }
}

function subcategoryLabel(r: ProductRecord, locale: Locale) {
  const c = categoryRecords.find((x) => x.slug === r.categorySlug)
  return c?.subcategories.find((s) => s.value === r.subcategory)?.label[locale] ?? r.subcategory
}

function localizeProduct(r: ProductRecord, locale: Locale): Product {
  const brandName = brandLabel(r.brand, locale)
  const farmL10n = brandRecords.find((b) => b.key === r.brand)?.label ?? { en: r.brand, zh: r.brand }
  const title = r.title[locale]
  const longDescription =
    locale === "zh"
      ? `${title.includes(brandName) ? title : `${brandName}出品的${title}`}是市面上的优选之一。${brandName}的一家人用心经营自己的有机产品，自然生长、适时采摘，让每一份都带着最好的风味送到你手中。`
      : `${title.includes(brandName) ? title : `${title} from ${brandName}`} are one of the best on the market. The family behind ${brandName} is giving full love to their bio products, grown naturally and harvested at the right moment so they arrive at your door full of flavour.`
  return {
    id: r.id,
    slug: r.slug,
    title,
    titleL10n: r.title,
    description: locale === "zh" ? "这里是一段简短的商品描述" : "Space for a small product description",
    longDescription,
    categorySlug: r.categorySlug,
    subcategory: r.subcategory,
    subcategoryLabel: subcategoryLabel(r, locale),
    brand: r.brand,
    brandName,
    farm: farmL10n[locale],
    farmL10n,
    price: r.price,
    oldPrice: r.oldPrice,
    rating: r.rating,
    reviewsCount: r.reviewsCount,
    questionsCount: r.questionsCount,
    sku: r.sku,
    freshnessDays: r.freshnessDays,
    stock: r.stock,
    units: r.units,
    deliveryDays: r.deliveryDays,
    deliveryArea: deliveryAreaLabels[r.deliveryArea][locale],
    freeShipping: r.freeShipping,
    tags: r.tags,
    createdAt: r.createdAt,
  }
}

export async function listCategories(locale: Locale): Promise<Category[]> {
  return categoryRecords.map((c) => localizeCategory(c.slug, locale)!)
}

export async function findCategory(slug: string, locale: Locale) {
  return localizeCategory(slug, locale)
}

export async function listProductTags(locale: Locale): Promise<Option[]> {
  return productTagRecords.map((t) => ({ value: t.key, label: t.label[locale] }))
}

export async function getProductBySlug(slug: string, locale: Locale) {
  const r = productRecords.find((p) => p.slug === slug)
  return r && localizeProduct(r, locale)
}

export async function getReviews(product: Product, locale: Locale): Promise<Review[]> {
  const rand = rng(Number(product.id.slice(1)) * 7)
  const texts = reviewTexts[locale]
  const count = Math.min(product.reviewsCount, 5)
  return Array.from({ length: count }, (_, i) => ({
    id: `${product.id}-r${i}`,
    productId: product.id,
    author: texts.authors[Math.floor(rand() * texts.authors.length)],
    rating: Math.max(1, Math.min(5, product.rating + Math.round(rand() * 2 - 1))),
    date: new Date(Date.UTC(2020, 5, 1 + i * 4)).toISOString(),
    body: texts.bodies[Math.floor(rand() * texts.bodies.length)],
  }))
}

export async function getProductQuestions(locale: Locale) {
  return questionRecords.map((r) => ({ q: r.q[locale], a: r.a[locale] }))
}

export async function getNutrition(locale: Locale) {
  return nutritionRecords.map((r) => ({ name: r.name[locale], quantity: r.quantity, dv: r.dv }))
}

function matches(r: ProductRecord, q: ProductQuery, locale: Locale) {
  if (q.category && q.category !== "all" && r.categorySlug !== q.category) return false
  if (q.subcategory && r.subcategory !== q.subcategory) return false
  if (q.q) {
    const needle = q.q.toLowerCase()
    const tagLabels = r.tags.flatMap((k) => Object.values(productTagRecords.find((t) => t.key === k)?.label ?? {}))
    // search both languages so "胡萝卜" and "carrot" work everywhere
    const hay = [r.title.en, r.title.zh, brandLabel(r.brand, "en"), brandLabel(r.brand, "zh"), r.subcategory, subcategoryLabel(r, "zh"), ...r.tags, ...tagLabels]
      .join(" ")
      .toLowerCase()
    if (!hay.includes(needle)) return false
  }
  if (q.brands?.length && !q.brands.includes(r.brand)) return false
  if (q.ratings?.length && !q.ratings.includes(r.rating)) return false
  const local = r.price * localeConfig[locale].rate
  if (q.minPrice != null && local < q.minPrice) return false
  if (q.maxPrice != null && local > q.maxPrice) return false
  if (q.discounted && !r.oldPrice) return false
  if (q.freeShipping && !r.freeShipping) return false
  if (q.inStock && r.stock <= 0) return false
  return true
}

const sorters: Record<NonNullable<ProductQuery["sort"]>, (a: ProductRecord, b: ProductRecord) => number> = {
  popular: (a, b) => b.reviewsCount - a.reviewsCount,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
}

export async function searchProducts(query: ProductQuery, locale: Locale): Promise<Paginated<Product>> {
  const pageSize = query.pageSize ?? 9
  const filtered = productRecords.filter((p) => matches(p, query, locale)).sort(sorters[query.sort ?? "popular"])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const page = Math.min(Math.max(1, query.page ?? 1), pageCount)
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize).map((r) => localizeProduct(r, locale)),
    total: filtered.length,
    page,
    pageSize,
    pageCount,
  }
}

/** Facet counts for the sidebar, computed on the category scope only. */
export async function getFacets(category: string, locale: Locale) {
  const scope = productRecords.filter((p) => matches(p, { category }, locale))
  const brandMap = new Map<string, number>()
  const subMap = new Map<string, number>()
  for (const p of scope) {
    brandMap.set(p.brand, (brandMap.get(p.brand) ?? 0) + 1)
    subMap.set(p.subcategory, (subMap.get(p.subcategory) ?? 0) + 1)
  }
  const subLabel = (value: string) =>
    categoryRecords.flatMap((c) => c.subcategories).find((s) => s.value === value)?.label[locale] ?? value
  return {
    brands: [...brandMap]
      .map(([value, count]) => ({ value, label: brandLabel(value, locale), count }))
      .sort((a, b) => a.value.localeCompare(b.value)),
    subcategories: [...subMap].map(([value, count]) => ({ value, label: subLabel(value), count })),
    toggles: {
      stock: scope.filter((p) => p.stock > 0).length,
      discounted: scope.filter((p) => p.oldPrice).length,
      shipping: scope.filter((p) => p.freeShipping).length,
    },
    total: scope.length,
  }
}

export async function getBestSelling(locale: Locale, limit = 3) {
  return [...productRecords].sort(sorters.popular).slice(0, limit).map((r) => localizeProduct(r, locale))
}

export async function getBestFromFarmers(locale: Locale, limit = 3) {
  return productRecords
    .filter((p) => p.categorySlug === "fruit-and-vegetables" || p.categorySlug === "meat-and-fish")
    .slice(0, limit)
    .map((r) => localizeProduct(r, locale))
}

export async function getFeatured(locale: Locale, limit = 4) {
  return productRecords.filter((p) => p.oldPrice).slice(0, limit).map((r) => localizeProduct(r, locale))
}

export async function getRelatedProducts(product: Product, locale: Locale, limit = 4) {
  return productRecords
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, limit)
    .map((r) => localizeProduct(r, locale))
}

export async function listTestimonials(locale: Locale) {
  return testimonialRecords.map((t) => ({ id: t.id, quote: t.quote[locale], author: t.author[locale] }))
}

function localizePost(r: (typeof blogRecords)[number], locale: Locale): BlogPost {
  const title = r.title[locale]
  return {
    slug: r.slug,
    title,
    excerpt: r.excerpt[locale],
    tag: r.tag,
    tagLabel: blogTagLabels[r.tag]?.[locale] ?? r.tag,
    author: r.author[locale],
    date: r.date,
    readMinutes: r.readMinutes,
    content: blogArticle(locale, title),
  }
}

export async function listBlogPosts(locale: Locale, { tag, page = 1, pageSize = 6 }: { tag?: string; page?: number; pageSize?: number } = {}) {
  const filtered = tag ? blogRecords.filter((p) => p.tag === tag) : blogRecords
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(Math.max(1, page), pageCount)
  return {
    items: filtered.slice((current - 1) * pageSize, current * pageSize).map((r) => localizePost(r, locale)),
    total: filtered.length,
    page: current,
    pageSize,
    pageCount,
  }
}

export async function getBlogPost(slug: string, locale: Locale) {
  const r = blogRecords.find((p) => p.slug === slug)
  return r && localizePost(r, locale)
}

export async function listBlogTags(locale: Locale) {
  const map = new Map<string, number>()
  for (const p of blogRecords) map.set(p.tag, (map.get(p.tag) ?? 0) + 1)
  return [...map].map(([value, count]) => ({ value, label: blogTagLabels[value]?.[locale] ?? value, count }))
}

export function blogTagLabel(tag: string, locale: Locale) {
  return blogTagLabels[tag]?.[locale] ?? tag
}

export async function getInfoPage(slug: string, locale: Locale) {
  const page = infoPages[slug]
  return page && { title: page.title[locale], intro: page.intro[locale] }
}

export function infoPageSlugs() {
  return Object.keys(infoPages)
}
