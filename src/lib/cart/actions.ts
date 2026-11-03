"use server"

/**
 * Cart & checkout server actions. The cart lives in the Medusa backend; the browser only
 * holds an httpOnly cookie with the cart id and calls these actions.
 */
import { cookies } from "next/headers"
import { medusa, MedusaError, storeRegion } from "@/lib/medusa/server"
import type { CartItem } from "@/types"
import type { AddToCartInput, CarrierOption, CartView, PlacedOrder, PlaceOrderInput } from "./types"

const COOKIE = "freshshop_cart_id"
const CART_FIELDS =
  "id,completed_at,item_subtotal,discount_total,shipping_total,tax_total,total,*items,*promotions,*shipping_methods,shipping_address.country_code"

type MedusaLineItem = {
  id: string
  product_handle: string | null
  product_title: string | null
  thumbnail: string | null
  variant_sku: string | null
  variant_title: string | null
  unit_price: number
  quantity: number
  metadata: { purchase?: string; months?: number; list_price?: number | null } | null
}
type MedusaCart = {
  id: string
  completed_at: string | null
  item_subtotal: number
  discount_total: number
  shipping_total: number
  tax_total: number
  total: number
  items: MedusaLineItem[]
  promotions: { code: string | null }[]
  shipping_methods: { shipping_option_id: string; data?: Record<string, unknown> | null; name: string }[]
  shipping_address: { country_code: string | null } | null
}

/**
 * Amounts are kept at full precision (e.g. a $1.127 shipping price that is exactly ¥8):
 * rounding happens only when they are converted/formatted for display.
 */
const amount = (n: number | null | undefined) => Number(n ?? 0)
const CARRIER_BY_NAME: Record<string, string> = { FedEx: "fedex", DHL: "dhl", "SF Express": "sf", "JD Logistics": "jd" }

function toView(cart: MedusaCart): CartView {
  const items: CartItem[] = cart.items
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((i) => {
      const subscription = i.metadata?.purchase === "subscription" && i.metadata.months
      return {
        lineId: i.id,
        productId: i.product_handle ?? "",
        slug: i.product_handle ?? "",
        title: { en: i.product_title ?? "", zh: i.product_title ?? "" },
        image: i.thumbnail ?? undefined,
        sku: i.variant_sku ?? "",
        variantLabel: i.variant_title ?? "",
        price: amount(i.unit_price),
        listPrice: amount(i.metadata?.list_price ?? i.unit_price),
        purchase: subscription ? { type: "subscription", months: Number(i.metadata!.months) } : { type: "once" },
        quantity: i.quantity,
      }
    })
  const method = cart.shipping_methods?.[0]
  return {
    id: cart.id,
    items,
    subtotal: amount(cart.item_subtotal),
    discount: amount(cart.discount_total),
    shipping: amount(cart.shipping_total),
    tax: amount(cart.tax_total),
    total: amount(cart.total),
    count: items.reduce((n, i) => n + i.quantity, 0),
    promoCode: cart.promotions?.find((p) => p.code)?.code ?? null,
    carrier: method ? (CARRIER_BY_NAME[method.name] ?? null) : null,
  }
}

async function retrieve(id: string) {
  const { cart } = await medusa<{ cart: MedusaCart }>(`/store/carts/${id}?fields=${CART_FIELDS}`)
  return cart
}

/** Current cart id from the cookie (optionally creating a new cart). Completed/missing carts are dropped. */
async function currentCartId(create: boolean): Promise<string | null> {
  const jar = await cookies()
  const existing = jar.get(COOKIE)?.value
  if (existing) {
    try {
      const cart = await retrieve(existing)
      if (!cart.completed_at) return existing
    } catch (error) {
      if (!(error instanceof MedusaError) || error.status !== 404) throw error
    }
    jar.delete(COOKIE)
  }
  if (!create) return null
  const region = await storeRegion()
  const { cart } = await medusa<{ cart: { id: string } }>("/store/carts", { body: { region_id: region.id } })
  jar.set(COOKIE, cart.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 })
  return cart.id
}

export async function getCart(): Promise<CartView | null> {
  const id = await currentCartId(false)
  return id ? toView(await retrieve(id)) : null
}

export async function addToCart(input: AddToCartInput): Promise<CartView> {
  const id = (await currentCartId(true))!
  await medusa(`/store/carts/${id}/purchase-items`, {
    body: { variant_id: input.variantId, quantity: input.quantity, purchase: input.purchase },
  })
  return toView(await retrieve(id))
}

export async function updateCartLine(lineId: string, quantity: number): Promise<CartView | null> {
  const id = await currentCartId(false)
  if (!id) return null
  await medusa(`/store/carts/${id}/line-items/${lineId}`, { body: { quantity: Math.max(1, Math.min(99, quantity)) } })
  return toView(await retrieve(id))
}

export async function removeCartLine(lineId: string): Promise<CartView | null> {
  const id = await currentCartId(false)
  if (!id) return null
  await medusa(`/store/carts/${id}/line-items/${lineId}`, { method: "DELETE" })
  return toView(await retrieve(id))
}

/** Applies a Medusa promotion code. Unknown codes leave the cart unchanged and return ok: false. */
export async function applyPromoCode(code: string): Promise<{ ok: boolean; cart: CartView | null }> {
  const id = await currentCartId(false)
  if (!id) return { ok: false, cart: null }
  const normalized = code.trim().toUpperCase()
  try {
    await medusa(`/store/carts/${id}/promotions`, { body: { promo_codes: [normalized] } })
  } catch (error) {
    if (!(error instanceof MedusaError) || error.status >= 500) throw error
  }
  const cart = toView(await retrieve(id))
  return { ok: cart.promoCode === normalized, cart }
}

/** Sets the destination country on the cart and returns the carriers available there. */
export async function prepareCheckout(country: "us" | "cn"): Promise<{ cart: CartView | null; carriers: CarrierOption[] }> {
  const id = await currentCartId(false)
  if (!id) return { cart: null, carriers: [] }
  const current = await retrieve(id)
  if (current.shipping_address?.country_code !== country)
    await medusa(`/store/carts/${id}`, { body: { shipping_address: { country_code: country } } })
  const { shipping_options } = await medusa<{
    shipping_options: { id: string; amount: number; type?: { code?: string } | null }[]
  }>(`/store/shipping-options?cart_id=${id}&fields=id,amount,*type`)
  const carriers = shipping_options
    .filter((o) => o.type?.code?.startsWith("carrier-"))
    .map((o) => ({ id: o.type!.code!.slice("carrier-".length), optionId: o.id, amount: amount(o.amount) }))
  return { cart: toView(await retrieve(id)), carriers }
}

export async function selectCarrier(optionId: string): Promise<CartView | null> {
  const id = await currentCartId(false)
  if (!id) return null
  await medusa(`/store/carts/${id}/shipping-methods`, { body: { option_id: optionId } })
  return toView(await retrieve(id))
}

/** Saves contact + addresses, makes sure the chosen carrier is set, pays with the demo provider and completes the cart. */
export async function placeOrder(input: PlaceOrderInput): Promise<PlacedOrder> {
  const id = await currentCartId(false)
  if (!id) throw new Error("Your cart is empty")
  const shipping = input.shippingAddress ?? input.address
  await medusa(`/store/carts/${id}`, {
    body: { email: input.email, billing_address: input.address, shipping_address: shipping },
  })
  const { carriers } = await prepareCheckout(shipping.country_code)
  const carrier = carriers.find((c) => c.id === input.carrier)
  if (!carrier) throw new Error(`Carrier ${input.carrier} is not available for this address`)
  await medusa(`/store/carts/${id}/shipping-methods`, { body: { option_id: carrier.optionId } })

  const { payment_collection } = await medusa<{ payment_collection: { id: string } }>("/store/payment-collections", { body: { cart_id: id } })
  await medusa(`/store/payment-collections/${payment_collection.id}/payment-sessions`, { body: { provider_id: "pp_system_default" } })
  const result = await medusa<{ type: string; order?: { id: string; display_id: number; email: string; total: number; items: { quantity: number }[] }; error?: { message: string } }>(
    `/store/carts/${id}/complete`,
    { body: {} },
  )
  if (result.type !== "order" || !result.order) throw new Error(result.error?.message ?? "Could not place the order")
  ;(await cookies()).delete(COOKIE)
  const order = result.order
  return {
    id: order.id,
    displayId: order.display_id,
    email: order.email,
    total: amount(order.total),
    count: order.items?.reduce((n, i) => n + i.quantity, 0) ?? 0,
  }
}
