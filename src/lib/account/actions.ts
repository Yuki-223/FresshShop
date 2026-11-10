"use server"

/**
 * Customer accounts (Medusa emailpass auth). The customer's JWT lives in an httpOnly cookie;
 * the browser only calls these actions. Orders placed while signed in belong to the customer
 * (lib/cart/actions.ts transfers the cart before completing it).
 */
import { cookies } from "next/headers"
import { medusa, MedusaError } from "@/lib/medusa/server"
import { variantImage } from "@/lib/data/metagenics/variant-image"
import type { AccountResult, AddressInput, Customer, OrderDetail, OrderLine, OrderSummary, Subscription } from "./types"

const COOKIE = "freshshop_customer_token"
// Medusa's JWTs expire after a day (http.jwtExpiresIn default "1d")
const MAX_AGE = 60 * 60 * 24

const CUSTOMER_FIELDS = "id,email,first_name,last_name,phone,*addresses"
const ORDER_FIELDS =
  "id,display_id,created_at,status,email,total,item_subtotal,discount_total,shipping_total,tax_total,*items,items.adjustments.code,shipping_methods.name,*shipping_address"

/** The signed-in customer's token, or undefined. */
export async function customerToken(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE)?.value
}

async function setToken(token: string) {
  ;(await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: MAX_AGE })
}

const message = (error: unknown) => (error instanceof Error ? error.message : String(error))

/** The signed-in customer, or null (no cookie, or an expired/invalid token — then the cookie is dropped). */
export async function getCustomer(): Promise<Customer | null> {
  const token = await customerToken()
  if (!token) return null
  try {
    const { customer } = await medusa<{ customer: Customer }>(`/store/customers/me?fields=${CUSTOMER_FIELDS}`, { token })
    return customer
  } catch (error) {
    if (error instanceof MedusaError && error.status === 401) {
      // cookies can only be changed in actions/route handlers; ignore when called while rendering
      try {
        ;(await cookies()).delete(COOKIE)
      } catch {}
      return null
    }
    throw error
  }
}

export async function signIn(email: string, password: string): Promise<AccountResult> {
  try {
    const { token } = await medusa<{ token: string }>("/auth/customer/emailpass", { body: { email: email.trim().toLowerCase(), password } })
    await setToken(token)
    return { ok: true }
  } catch (error) {
    if (error instanceof MedusaError && error.status === 401) return { ok: false, error: "invalid" }
    return { ok: false, error: message(error) }
  }
}

export async function signUp(input: { firstName: string; lastName: string; email: string; password: string }): Promise<AccountResult> {
  const email = input.email.trim().toLowerCase()
  try {
    const { token: registration } = await medusa<{ token: string }>("/auth/customer/emailpass/register", { body: { email, password: input.password } })
    await medusa("/store/customers", {
      body: { email, first_name: input.firstName.trim(), last_name: input.lastName.trim() },
      token: registration,
    })
  } catch (error) {
    if (error instanceof MedusaError && /already exists/i.test(error.message)) return { ok: false, error: "exists" }
    return { ok: false, error: message(error) }
  }
  return signIn(email, input.password)
}

export async function signOut(): Promise<void> {
  ;(await cookies()).delete(COOKIE)
}

async function withToken<T>(run: (token: string) => Promise<T>): Promise<T> {
  const token = await customerToken()
  if (!token) throw new Error("Not signed in")
  return run(token)
}

export async function updateProfile(input: { firstName: string; lastName: string; phone: string }): Promise<AccountResult> {
  try {
    await withToken((token) =>
      medusa("/store/customers/me", {
        body: { first_name: input.firstName.trim(), last_name: input.lastName.trim(), phone: input.phone.trim() || null },
        token,
      }),
    )
    return { ok: true }
  } catch (error) {
    return { ok: false, error: message(error) }
  }
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<AccountResult> {
  try {
    await withToken((token) => medusa("/store/customers/me/password", { body: { old_password: oldPassword, new_password: newPassword }, token }))
    return { ok: true }
  } catch (error) {
    if (error instanceof MedusaError && error.status === 401) return { ok: false, error: "wrongPassword" }
    return { ok: false, error: message(error) }
  }
}

const cleanAddress = (a: AddressInput) => ({
  first_name: a.first_name.trim(),
  last_name: a.last_name.trim(),
  address_1: a.address_1.trim(),
  city: a.city.trim(),
  province: a.province?.trim() || null,
  postal_code: a.postal_code?.trim() || null,
  country_code: a.country_code,
  phone: a.phone?.trim() || null,
})

/** Saves an address (new when no id). `isDefault` makes it the default shipping address. */
export async function saveAddress(input: AddressInput, id?: string, isDefault?: boolean): Promise<AccountResult> {
  try {
    await withToken((token) =>
      medusa(id ? `/store/customers/me/addresses/${id}` : "/store/customers/me/addresses", {
        body: { ...cleanAddress(input), ...(isDefault !== undefined ? { is_default_shipping: isDefault, is_default_billing: isDefault } : {}) },
        token,
      }),
    )
    return { ok: true }
  } catch (error) {
    return { ok: false, error: message(error) }
  }
}

export async function deleteAddress(id: string): Promise<AccountResult> {
  try {
    await withToken((token) => medusa(`/store/customers/me/addresses/${id}`, { method: "DELETE", token }))
    return { ok: true }
  } catch (error) {
    return { ok: false, error: message(error) }
  }
}

export async function setDefaultAddress(id: string): Promise<AccountResult> {
  try {
    await withToken((token) => medusa(`/store/customers/me/addresses/${id}`, { body: { is_default_shipping: true, is_default_billing: true }, token }))
    return { ok: true }
  } catch (error) {
    return { ok: false, error: message(error) }
  }
}

// ---------- orders ----------
type MedusaOrderItem = {
  id: string
  title: string
  product_handle: string | null
  thumbnail: string | null
  variant_title: string | null
  variant_sku: string | null
  quantity: number
  unit_price: number
  total: number
  metadata: { purchase?: string; months?: number } | null
  adjustments?: { code: string | null }[]
}
type MedusaOrder = {
  id: string
  display_id: number
  created_at: string
  status: string
  email: string
  total: number
  item_subtotal: number
  discount_total: number
  shipping_total: number
  tax_total: number
  items: MedusaOrderItem[]
  shipping_methods: { name: string }[]
  shipping_address: OrderDetail["shippingAddress"]
}

const toLine = (i: MedusaOrderItem): OrderLine => ({
  id: i.id,
  title: i.title,
  handle: i.product_handle,
  thumbnail: variantImage(i.product_handle, i.variant_sku) ?? i.thumbnail,
  variant: i.variant_title ?? "",
  sku: i.variant_sku ?? "",
  quantity: i.quantity,
  unitPrice: Number(i.unit_price),
  total: Number(i.total),
  subscriptionMonths: i.metadata?.purchase === "subscription" && i.metadata.months ? Number(i.metadata.months) : null,
})

const toSummary = (o: MedusaOrder): OrderSummary => ({
  id: o.id,
  displayId: o.display_id,
  createdAt: o.created_at,
  status: o.status,
  total: Number(o.total),
  itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
  thumbnails: o.items.map((i) => variantImage(i.product_handle, i.variant_sku) ?? i.thumbnail).filter((x): x is string => !!x),
})

/** All of the customer's orders, newest first. */
export async function listOrders(): Promise<OrderSummary[]> {
  const { orders } = await withToken((token) =>
    medusa<{ orders: MedusaOrder[] }>(`/store/orders?limit=100&order=-created_at&fields=${ORDER_FIELDS}`, { token }),
  )
  return orders.map(toSummary)
}

/** One order of the signed-in customer, or null when it isn't theirs / doesn't exist. */
export async function getOrder(id: string): Promise<OrderDetail | null> {
  try {
    const { order } = await withToken((token) => medusa<{ order: MedusaOrder & { customer_id?: string } }>(`/store/orders/${id}?fields=${ORDER_FIELDS},customer_id`, { token }))
    const me = await getCustomer()
    if (!me || order.customer_id !== me.id) return null
    return {
      ...toSummary(order),
      email: order.email,
      items: order.items.map(toLine),
      itemSubtotal: Number(order.item_subtotal),
      discount: Number(order.discount_total),
      shipping: Number(order.shipping_total),
      tax: Number(order.tax_total),
      carrier: order.shipping_methods?.[0]?.name ?? null,
      promoCodes: [...new Set(order.items.flatMap((i) => i.adjustments ?? []).map((a) => a.code).filter((c): c is string => !!c))],
      shippingAddress: order.shipping_address,
    }
  } catch (error) {
    if (error instanceof MedusaError && (error.status === 404 || error.status === 401)) return null
    throw error
  }
}

/**
 * Subscriptions = subscription lines of the customer's orders (the newest order wins when the
 * same product/size/interval was ordered again). Demo only: nothing is billed or shipped again.
 */
export async function listSubscriptions(): Promise<Subscription[]> {
  const { orders } = await withToken((token) =>
    medusa<{ orders: MedusaOrder[] }>(`/store/orders?limit=100&order=-created_at&fields=${ORDER_FIELDS}`, { token }),
  )
  const seen = new Map<string, Subscription>()
  for (const o of orders) {
    for (const i of o.items) {
      const line = toLine(i)
      if (!line.subscriptionMonths) continue
      const key = `${line.sku}:${line.subscriptionMonths}`
      if (seen.has(key)) continue
      seen.set(key, {
        key,
        title: line.title,
        handle: line.handle,
        thumbnail: line.thumbnail,
        variant: line.variant,
        months: line.subscriptionMonths,
        price: line.unitPrice,
        quantity: line.quantity,
        orderId: o.id,
        orderDisplayId: o.display_id,
        startedAt: o.created_at,
      })
    }
  }
  return [...seen.values()]
}

/** Email + default address for the checkout form (null when signed out). */
export async function getCheckoutPrefill(): Promise<{
  email: string
  phone: string | null
  address: Customer["addresses"][number] | null
  name: { first: string; last: string }
} | null> {
  const customer = await getCustomer()
  if (!customer) return null
  const address = customer.addresses.find((a) => a.is_default_shipping) ?? customer.addresses[0] ?? null
  return { email: customer.email, phone: customer.phone, address, name: { first: customer.first_name ?? "", last: customer.last_name ?? "" } }
}
