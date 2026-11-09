/**
 * Data access layer. Every page/component reads data through these async functions only.
 *
 * - Products (prices, stock, variants, subscriptions, ratings, content) come from the
 *   Medusa backend (backend/) via lib/data/metagenics/remote.ts — request-time data.
 * - The store's taxonomy (navigation groups, category names, product lines) comes from the
 *   local catalog, so the header and footer can still be prerendered.
 *
 * Product content is the collected English source text for every locale;
 * only navigation/category/form labels are translated. Chinese search words are mapped to
 * English ones (lib/search/zh-terms.ts).
 */
import { localeConfig, type Locale } from "@/i18n/config"
import { catalog, type CatalogProduct } from "@/lib/data/metagenics"
import { remoteProducts } from "@/lib/data/metagenics/remote"
import { loadReviews } from "@/lib/reviews/actions"
import type { ReviewPage } from "@/lib/reviews/types"
import { categoryZh, formZh, navGroups } from "@/lib/data/metagenics/groups"
import productGallery from "@/lib/data/metagenics/product-gallery.json"
import { infoPages } from "@/lib/data/pages"
import { matchesZhQuery, zhQueryGroups } from "@/lib/search/zh-terms"
import type { Category, Option, Paginated, Product, ProductDetail, ProductQuery } from "@/types"

/** Products from the backend (request-time). */
const records = () => remoteProducts()

export async function priceRange(locale: Locale) {
  const prices = (await records()).flatMap((p) => p.variants.map((v) => v.price))
  const maxBase = Math.ceil(Math.max(0, ...prices) / 10) * 10
  return { min: 0, max: Math.ceil(maxBase * localeConfig[locale].rate) }
}

const categoryLabel = (slug: string, locale: Locale) =>
  (locale === "zh" ? categoryZh[slug] : undefined) ?? catalog.categories.find((c) => c.slug === slug)?.name ?? slug
const formLabel = (form: string, locale: Locale) => (locale === "zh" ? (formZh[form] ?? form) : form)

function localizeGroup(slug: string, locale: Locale): Category | undefined {
  const g = navGroups.find((x) => x.slug === slug)
  if (!g) return undefined
  return { slug: g.slug, name: g.name[locale], subcategories: g.categories.map((c) => ({ value: c, label: categoryLabel(c, locale) })) }
}

function toProduct(r: CatalogProduct, locale: Locale): Product {
  const prices = r.variants.map((v) => v.price)
  return {
    id: r.slug,
    medusaId: r.medusaId,
    slug: r.slug,
    title: r.name,
    titleL10n: { en: r.name, zh: r.name },
    description: r.subtitle ?? r.summary ?? "",
    summary: r.summary,
    image: r.image,
    healthCategories: r.categories.map((c) => ({ value: c, label: categoryLabel(c, locale) })),
    productLine: r.productLine,
    form: r.form,
    formLabel: formLabel(r.form, locale),
    isBundle: r.isBundle,
    rating: r.rating,
    variants: r.variants,
    price: Math.min(...prices),
    maxSave: Math.max(0, ...r.variants.flatMap((v) => v.subscriptions.map((s) => s.savePercent))),
    available: r.variants.some((v) => v.available),
    sourceUrl: r.sourceUrl,
  }
}

/** Extra photos and brand images per product (public/products/<slug>/), see scripts/build-product-gallery.py. */
const galleries = productGallery as Record<string, { gallery: string[]; promo: string[] }>

function toDetail(r: CatalogProduct, locale: Locale): ProductDetail {
  const extra = galleries[r.slug]
  return {
    ...toProduct(r, locale),
    content: r.description,
    supplementFacts: r.supplementFacts ?? undefined,
    directions: r.directions,
    storage: r.storage,
    cautions: r.cautions,
    warnings: r.warnings,
    faq: r.faq,
    related: r.related,
    gallery: [...(r.image ? [r.image] : []), ...(extra?.gallery ?? [])],
    promo: extra?.promo ?? [],
  }
}

/** Drop the long detail content (description, FAQ, facts) — e.g. before passing a product to a client component. */
export function toListing(p: ProductDetail): Product {
  const { content, faq, supplementFacts, related, directions, storage, cautions, warnings, gallery, promo, ...listing } = p
  void [content, faq, supplementFacts, related, directions, storage, cautions, warnings, gallery, promo]
  return listing
}

export async function listCategories(locale: Locale): Promise<Category[]> {
  return navGroups.map((g) => localizeGroup(g.slug, locale)!)
}

export async function findCategory(slug: string, locale: Locale) {
  return localizeGroup(slug, locale)
}

/** The 18 source health categories with product counts. */
export async function listHealthCategories(locale: Locale) {
  const all = await records()
  return catalog.categories.map((c) => ({
    value: c.slug,
    label: categoryLabel(c.slug, locale),
    count: all.filter((p) => p.categories.includes(c.slug)).length,
    group: navGroups.find((g) => g.categories.includes(c.slug))!.slug,
  }))
}

/** Footer "Product tags": the product lines with the most products (store taxonomy → local catalog, prerenderable). */
export async function listProductTags(): Promise<Option[]> {
  const counts = new Map<string, number>()
  for (const p of catalog.products) if (p.productLine) counts.set(p.productLine, (counts.get(p.productLine) ?? 0) + 1)
  return [...counts]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map(([value]) => ({ value, label: value }))
}

export async function getProductBySlug(slug: string, locale: Locale) {
  const r = (await records()).find((p) => p.slug === slug)
  return r && toDetail(r, locale)
}

export async function getProductsBySlugs(slugs: string[], locale: Locale) {
  const all = await records()
  return slugs.map((s) => all.find((p) => p.slug === s)).filter((r): r is CatalogProduct => !!r).map((r) => toProduct(r, locale))
}

function inGroup(r: CatalogProduct, group?: string) {
  if (!group || group === "all") return true
  const g = navGroups.find((x) => x.slug === group)
  return !!g && r.categories.some((c) => g.categories.includes(c))
}

/**
 * `zh`: the Chinese query cut into English word groups (lib/search/zh-terms.ts), or null.
 * A Chinese query is also matched against the summary, since the product names are mostly brand names.
 */
function matches(r: CatalogProduct, q: ProductQuery, locale: Locale, zh: RegExp[][] | null) {
  if (!inGroup(r, q.category)) return false
  if (q.subcategory && !r.categories.includes(q.subcategory)) return false
  if (q.q) {
    const hay = [r.name, r.subtitle, r.productLine, r.form, ...r.categories.map((c) => categoryLabel(c, "en")), ...r.variants.map((v) => v.sku)]
      .join(" ")
      .toLowerCase()
    if (zh) {
      const zhLabels = [...r.categories.map((c) => categoryLabel(c, "zh")), formLabel(r.form, "zh")].join(" ")
      if (!matchesZhQuery(zh, q.q, `${hay} ${r.summary ?? ""}`, zhLabels)) return false
    } else if (!hay.includes(q.q.toLowerCase())) return false
  }
  if (q.brands?.length && !q.brands.includes(r.productLine ?? "")) return false
  if (q.forms?.length && !q.forms.includes(r.form)) return false
  if (q.ratings?.length && !(r.rating && q.ratings.some((n) => r.rating!.value >= n && r.rating!.value < n + 1))) return false
  const local = Math.min(...r.variants.map((v) => v.price)) * localeConfig[locale].rate
  if (q.minPrice != null && local < q.minPrice) return false
  if (q.maxPrice != null && local > q.maxPrice) return false
  if (q.subscribe && !r.variants.some((v) => v.subscriptions.some((s) => s.savePercent > 0))) return false
  if (q.bundle && !r.isBundle) return false
  if (q.inStock && !r.variants.some((v) => v.available)) return false
  return true
}

const minPrice = (r: CatalogProduct) => Math.min(...r.variants.map((v) => v.price))
const sorters: Record<NonNullable<ProductQuery["sort"]>, (a: CatalogProduct, b: CatalogProduct) => number> = {
  popular: (a, b) => (b.rating?.count ?? 0) - (a.rating?.count ?? 0),
  name: (a, b) => a.name.localeCompare(b.name),
  "price-asc": (a, b) => minPrice(a) - minPrice(b),
  "price-desc": (a, b) => minPrice(b) - minPrice(a),
  rating: (a, b) => (b.rating?.value ?? 0) - (a.rating?.value ?? 0) || (b.rating?.count ?? 0) - (a.rating?.count ?? 0),
}

export async function searchProducts(query: ProductQuery, locale: Locale): Promise<Paginated<Product>> {
  const pageSize = query.pageSize ?? 9
  const zh = query.q ? zhQueryGroups(query.q) : null
  const filtered = (await records()).filter((p) => matches(p, query, locale, zh)).sort(sorters[query.sort ?? "popular"])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const page = Math.min(Math.max(1, query.page ?? 1), pageCount)
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize).map((r) => toProduct(r, locale)),
    total: filtered.length,
    page,
    pageSize,
    pageCount,
  }
}

/** Facet counts for the sidebar, computed on the navigation-group scope only. */
export async function getFacets(group: string, locale: Locale) {
  const scope = (await records()).filter((p) => inGroup(p, group))
  const count = (key: (p: CatalogProduct) => string[]) => {
    const m = new Map<string, number>()
    for (const p of scope) for (const k of key(p)) m.set(k, (m.get(k) ?? 0) + 1)
    return m
  }
  const g = navGroups.find((x) => x.slug === group)
  const subMap = count((p) => p.categories.filter((c) => !g || g.categories.includes(c)))
  return {
    subcategories: [...subMap]
      .map(([value, n]) => ({ value, label: categoryLabel(value, locale), count: n }))
      .sort((a, b) => b.count - a.count),
    brands: [...count((p) => (p.productLine ? [p.productLine] : []))]
      .map(([value, n]) => ({ value, label: value, count: n }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value)),
    forms: [...count((p) => [p.form])].map(([value, n]) => ({ value, label: formLabel(value, locale), count: n })).sort((a, b) => b.count - a.count),
    /** star buckets as the rating filter uses them: 4 → 4.0–4.99 (Vitacost-style sidebar shows these counts) */
    ratings: [5, 4, 3, 2, 1].map((n) => ({ value: n, count: scope.filter((p) => p.rating && p.rating.value >= n && p.rating.value < n + 1).length })),
    toggles: {
      stock: scope.filter((p) => p.variants.some((v) => v.available)).length,
      subscribe: scope.filter((p) => p.variants.some((v) => v.subscriptions.some((s) => s.savePercent > 0))).length,
      bundle: scope.filter((p) => p.isBundle).length,
    },
    total: scope.length,
  }
}

export async function getTopRated(locale: Locale, limit = 3) {
  return [...(await records())]
    .filter((p) => (p.rating?.count ?? 0) >= 5 && !p.isBundle)
    .sort(sorters.rating)
    .slice(0, limit)
    .map((r) => toProduct(r, locale))
}

export async function getMostReviewed(locale: Locale, limit = 3) {
  return [...(await records())].sort(sorters.popular).slice(0, limit).map((r) => toProduct(r, locale))
}

export async function getBundles(locale: Locale, limit = 4) {
  return (await records()).filter((p) => p.isBundle).sort(sorters.popular).slice(0, limit).map((r) => toProduct(r, locale))
}

export async function getByCategory(category: string, locale: Locale, limit = 3) {
  return (await records()).filter((p) => p.categories.includes(category)).sort(sorters.popular).slice(0, limit).map((r) => toProduct(r, locale))
}

/** Products of one product line (e.g. "UltraFlora"), most reviewed first. */
export async function getByProductLine(line: string, locale: Locale, limit = 10) {
  return (await records()).filter((p) => p.productLine === line).sort(sorters.popular).slice(0, limit).map((r) => toProduct(r, locale))
}

export async function getRelatedProducts(product: ProductDetail, locale: Locale, limit = 4) {
  const picked = (await getProductsBySlugs(product.related, locale)).slice(0, limit)
  if (picked.length >= limit) return picked
  const firstCat = product.healthCategories[0]?.value
  const extra = (await records())
    .filter((p) => p.slug !== product.slug && !picked.some((x) => x.slug === p.slug) && (!firstCat || p.categories.includes(firstCat)))
    .sort(sorters.popular)
    .slice(0, limit - picked.length)
    .map((r) => toProduct(r, locale))
  return [...picked, ...extra]
}

/** First page of written reviews + the merged rating, for the product page (request-time). */
export async function getProductReviews(product: ProductDetail): Promise<ReviewPage> {
  if (!product.medusaId) return { reviews: [], count: 0, summary: product.rating ?? null, breakdown: [] }
  return loadReviews(product.medusaId, 0)
}

export async function getInfoPage(slug: string, locale: Locale) {
  const page = infoPages[slug]
  return page && { title: page.title[locale], intro: page.intro[locale] }
}

export function infoPageSlugs() {
  return Object.keys(infoPages)
}

export function catalogSource() {
  return catalog.source
}
