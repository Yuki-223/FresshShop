export type Unit = "pcs" | "kgs" | "box" | "pack"

export interface Category {
  slug: string
  name: string
  subcategories: string[]
}

export interface Product {
  id: string
  slug: string
  title: string
  description: string
  longDescription: string
  categorySlug: string
  subcategory: string
  brand: string
  farm: string
  /** current price in USD */
  price: number
  /** original price before discount, if discounted */
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
  tag: string
  author: string
  date: string
  readMinutes: number
  content: BlogBlock[]
}

export type SortKey = "popular" | "newest" | "price-asc" | "price-desc" | "rating"

export interface ProductQuery {
  category?: string
  subcategory?: string
  q?: string
  brands?: string[]
  ratings?: number[]
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

/** Snapshot of a product stored in the cart (prices locked at add time). */
export interface CartItem {
  productId: string
  slug: string
  title: string
  price: number
  oldPrice?: number
  rating: number
  farm: string
  freshnessDays: number
  units: Unit[]
  quantity: number
  unit: Unit
}

export type ProductSnapshot = Omit<CartItem, "quantity" | "unit">
