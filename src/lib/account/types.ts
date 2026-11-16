/** Customer account data as the storefront uses it (from the Medusa Store API). */
import type { OrderStage } from "./order-stage"

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
  variantId: string | null
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
  /** Medusa's raw fields, kept for debugging; pages should read `stage`. */
  status: string
  paymentStatus: string
  fulfillmentStatus: string
  /** Buyer-facing stage derived from the three raw fields (see order-stage.ts). */
  stage: OrderStage
  total: number
  itemCount: number
  thumbnails: string[]
  /** handle of the first product still in the catalog — where "write a review" goes */
  firstHandle: string | null
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

export type TrackingCode = "picked_up" | "departed" | "arrived" | "in_transit" | "out_for_delivery" | "delivered" | "exception" | "note"

export interface TrackingEvent {
  id: string
  code: TrackingCode
  location: string | null
  note: string | null
  occurredAt: string
}

/** One parcel of an order, with what has happened to it so far (newest first). */
export interface Shipment {
  id: string
  carrierCode: "fedex" | "dhl" | "sf" | "jd" | "other"
  carrierName: string
  trackingNumber: string
  origin: string
  destination: string
  shippedAt: string
  deliveredAt: string | null
  status: "shipped" | "in_transit" | "out_for_delivery" | "delivered" | "exception"
  events: TrackingEvent[]
}
