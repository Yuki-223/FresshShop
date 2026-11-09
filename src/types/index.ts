import type { L10n } from "@/i18n/config"

/** A filterable value with a stable key (used in URLs) and a localized label. */
export interface Option {
  value: string
  label: string
}

/** Navigation group (top nav item). `subcategories` are the source health categories. */
export interface Category {
  slug: string
  name: string
  subcategories: Option[]
}

export interface SubscriptionOffer {
  /** delivery interval in months */
  months: number
  /** price per delivery in USD */
  price: number
  savePercent: number
}

export interface Variant {
  /** Medusa variant id (needed to add the variant to a backend cart) */
  id?: string
  sku: string
  /** "60 Capsules", "30 Servings · Vanilla", "Bundle" */
  label: string
  size?: string
  flavor?: string
  /** one-time purchase price in USD */
  price: number
  subscriptions: SubscriptionOffer[]
  available: boolean
}

export interface Rating {
  value: number
  count: number
}

/** Product as used by listings — already localized for the requested locale. */
export interface Product {
  /** stable storefront id = handle (used by wish list / compare) */
  id: string
  /** Medusa product id (reviews are stored against it) */
  medusaId?: string
  slug: string
  title: string
  /** Title in every language — stored in the cart so it survives a language switch. */
  titleL10n: L10n
  /** short line under the title on cards */
  description: string
  summary?: string
  image?: string
  /** source health categories (stable keys) and their labels */
  healthCategories: Option[]
  productLine?: string
  form: string
  formLabel: string
  isBundle: boolean
  rating?: Rating
  variants: Variant[]
  /** lowest one-time price across variants (USD) */
  price: number
  /** best subscription saving across variants, in % */
  maxSave: number
  available: boolean
  sourceUrl: string
}

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }

export interface SupplementFacts {
  servingSize?: string
  servings?: string
  rows: { name: string; amount: string; dv: string }[]
}

export interface ProductQA {
  q: string
  a: string
}

/** Everything the product detail page needs. */
export interface ProductDetail extends Product {
  content: ContentBlock[]
  supplementFacts?: SupplementFacts
  directions?: string
  storage?: string
  cautions?: string
  warnings?: string
  faq: ProductQA[]
  related: string[]
  /** photo gallery: the main image first, then neutral photos (Supplement Facts label, directions) */
  gallery: string[]
  /** the brand's marketing images, shown under "From the Brand" */
  promo: string[]
}

export type SortKey = "popular" | "name" | "price-asc" | "price-desc" | "rating"

export interface ProductQuery {
  /** navigation group slug, or "all" */
  category?: string
  /** source health category key */
  subcategory?: string
  q?: string
  /** product lines */
  brands?: string[]
  forms?: string[]
  /** minimum star rating buckets (4 → 4.0–4.99) */
  ratings?: number[]
  /** price bounds in the locale's display currency */
  minPrice?: number
  maxPrice?: number
  subscribe?: boolean
  bundle?: boolean
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

export type PurchaseMode = { type: "once" } | { type: "subscription"; months: number }

/** Cart line: one variant bought one way. Prices locked at add time, text in all languages. */
export interface CartItem {
  /** sku + purchase mode, e.g. "ADRES|sub3" */
  lineId: string
  productId: string
  slug: string
  title: L10n
  image?: string
  sku: string
  variantLabel: string
  /** unit price for the chosen purchase mode (USD) */
  price: number
  /** one-time price, shown struck through for subscriptions (USD) */
  listPrice: number
  purchase: PurchaseMode
  quantity: number
}

/** What the storefront sends when adding to the cart (display fields are used for the toast only). */
export type CartLineInput = Omit<CartItem, "lineId" | "quantity"> & { variantId?: string }
