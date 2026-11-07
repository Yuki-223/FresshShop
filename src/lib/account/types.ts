/** Customer account data as the storefront uses it (from the Medusa Store API). */

export interface CustomerAddress {
  id: string
  first_name: string | null
  last_name: string | null
  address_1: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  country_code: string | null
  phone: string | null
  is_default_shipping: boolean
}

export interface Customer {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  addresses: CustomerAddress[]
}

export interface AddressInput {
  first_name: string
  last_name: string
  address_1: string
  city: string
  province?: string
  postal_code?: string
  country_code: "us" | "cn"
  phone?: string
}

export interface OrderLine {
  id: string
  title: string
  handle: string | null
  thumbnail: string | null
  variant: string
  sku: string
  quantity: number
  unitPrice: number
  total: number
  /** null = one-time purchase */
  subscriptionMonths: number | null
}

export interface OrderSummary {
  id: string
  displayId: number
  createdAt: string
  status: string
  total: number
  itemCount: number
  thumbnails: string[]
}

export interface OrderDetail extends OrderSummary {
  email: string
  items: OrderLine[]
  itemSubtotal: number
  discount: number
  shipping: number
  tax: number
  carrier: string | null
  promoCodes: string[]
  shippingAddress: Omit<CustomerAddress, "id" | "is_default_shipping"> | null
}

export interface Subscription {
  key: string
  title: string
  handle: string | null
  thumbnail: string | null
  variant: string
  months: number
  price: number
  quantity: number
  orderId: string
  orderDisplayId: number
  startedAt: string
}

export type AccountResult = { ok: true } | { ok: false; error: string }
