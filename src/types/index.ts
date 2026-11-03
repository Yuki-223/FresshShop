import type { L10n } from "@/i18n/config"

export type Unit = "pcs" | "kgs" | "box" | "pack"

/** A filterable value with a stable key (used in URLs) and a localized label. */
export interface Option {
  value: string
  label: string
}

export interface Category {
  slug: string
  name: string
  subcategories: Option[]
}

/** Product as returned by the API — already localized for the requested locale. */
export interface Product {
  id: string
  slug: string
  title: string
  /** Title in every language — stored in the cart so it survives a language switch. */
  titleL10n: L10n
  description: string
  longDescription: string
  categorySlug: string
  /** Stable subcategory key (URL value) + localized label. */
  subcategory: string
  subcategoryLabel: string
  /** Stable brand key (URL value) + localized label. */
  brand: string
  brandName: string
  farm: string
  farmL10n: L10n
  /** current price in USD (base currency) */
  price: number
  /** original price before discount, in USD, if discounted */
  oldPrice?: number
  rating: number
  reviewsCount: number
  questionsCount: number
  sku: string
  freshnessDays: number
  stock: number
  units: Unit[]
  deliveryDays: number
  deliveryArea: string
  freeShipping: boolean
  tags: string[]
  createdAt: string
}

export interface Review {
  id: string
  productId: string
  author: string
  rating: number
  date: string
  body: string
}

export interface Testimonial {
  id: string
  quote: string
  author: string
}

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string }
  | { type: "image"; caption?: string }
  | { type: "list"; items: string[] }

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  /** stable tag key (URL value) */
  tag: string
  tagLabel: string
  author: string
  date: string
  readMinutes: number
  content: BlogBlock[]
}

export interface ProductQA {
  q: string
  a: string
}

export interface NutritionRow {
  name: string
  quantity: string
  dv: string
}

export type SortKey = "popular" | "newest" | "price-asc" | "price-desc" | "rating"

export interface ProductQuery {
  category?: string
  subcategory?: string
  q?: string
  brands?: string[]
  ratings?: number[]
  /** price bounds in the locale's display currency */
  minPrice?: number
  maxPrice?: number
  discounted?: boolean
  freeShipping?: boolean
  inStock?: boolean
  sort?: SortKey
  page?: number
  pageSize?: number
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  pageCount: number
}

/** Snapshot of a product stored in the cart (prices locked at add time, text in all languages). */
export interface CartItem {
  productId: string
  slug: string
  title: L10n
  /** base (USD) unit price */
  price: number
  oldPrice?: number
  rating: number
  farm: L10n
  freshnessDays: number
  units: Unit[]
  quantity: number
  unit: Unit
}

export type ProductSnapshot = Omit<CartItem, "quantity" | "unit">
