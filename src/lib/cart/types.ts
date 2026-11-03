import type { CartItem, PurchaseMode } from "@/types"

/** Cart as computed by the Medusa backend. All amounts are USD (base currency). */
export interface CartView {
  id: string
  items: CartItem[]
  /** before discounts */
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  count: number
  promoCode: string | null
  /** carrier id (fedex / dhl / sf / jd) of the selected shipping method */
  carrier: string | null
}

export interface AddToCartInput {
  variantId: string
  quantity: number
  purchase: PurchaseMode
}

export interface CarrierOption {
  /** fedex / dhl / sf / jd */
  id: string
  optionId: string
  /** USD */
  amount: number
}

export interface CheckoutAddress {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  province?: string
  postal_code?: string
  country_code: "us" | "cn"
  phone?: string
}

export interface PlaceOrderInput {
  email: string
  address: CheckoutAddress
  /** ship somewhere else than the billing address */
  shippingAddress?: CheckoutAddress
  carrier: string
}

export interface PlacedOrder {
  id: string
  displayId: number
  email: string
  total: number
  count: number
}
