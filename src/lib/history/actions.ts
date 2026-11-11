"use server"

/**
 * Browsing history ("recently viewed"). Signed-in customers' history lives in the backend
 * (GET/POST/DELETE /store/customers/me/browsing-history); guests' history lives in their browser
 * (lib/store/history.ts) and is sent along when it has to be shown or merged.
 */
import { isLocale } from "@/i18n/config"
import { customerToken } from "@/lib/account/actions"
import { getProductsByMedusaIds } from "@/lib/api"
import { medusa, MedusaError } from "@/lib/medusa/server"
import { HISTORY_LIMIT, SHELF_SIZE, type HistoryEntry, type ViewedItem } from "./types"

type BackendItem = { product_id: string; viewed_at: string }

/** The signed-in customer's history (newest first), or null when signed out / the token expired. */
async function backendHistory(token: string | undefined, limit: number): Promise<ViewedItem[] | null> {
  if (!token) return null
  try {
    const { items } = await medusa<{ items: BackendItem[] }>(`/store/customers/me/browsing-history?limit=${limit}`, { token })
    return items.map((i) => ({ productId: i.product_id, viewedAt: i.viewed_at }))
  } catch (error) {
    if (error instanceof MedusaError && error.status === 401) return null
    throw error
  }
}

const cleanItems = (items: ViewedItem[]) =>
  items
    .filter((i) => typeof i?.productId === "string" && i.productId.length <= 64 && !Number.isNaN(Date.parse(i.viewedAt)))
    .slice(0, HISTORY_LIMIT)

async function withProducts(items: ViewedItem[], locale: string): Promise<HistoryEntry[]> {
  if (!isLocale(locale) || items.length === 0) return []
  const products = await getProductsByMedusaIds(
    items.map((i) => i.productId),
    locale,
  )
  const byId = new Map(products.map((p) => [p.medusaId, p]))
  return items.flatMap((i) => {
    const product = byId.get(i.productId)
    return product ? [{ product, viewedAt: i.viewedAt }] : []
  })
}

/**
 * A product page was opened. Signed in: saved to the account, returns true. Signed out: returns
 * false and the browser keeps it in the guest history instead.
 */
export async function recordView(productId: string): Promise<boolean> {
  const token = await customerToken()
  if (!token) return false
  try {
    await medusa("/store/customers/me/browsing-history", { body: { items: [{ product_id: productId }] }, token })
    return true
  } catch (error) {
    if (error instanceof MedusaError && error.status === 401) return false
    throw error
  }
}

/** Right after signing in: the guest history of this browser goes into the account. */
export async function mergeGuestHistory(items: ViewedItem[]): Promise<boolean> {
  const token = await customerToken()
  const clean = cleanItems(items)
  if (!token) return false
  if (clean.length === 0) return true
  await medusa("/store/customers/me/browsing-history", {
    body: { items: clean.map((i) => ({ product_id: i.productId, viewed_at: i.viewedAt })) },
    token,
  })
  return true
}

/**
 * The "Recently viewed" shelf: the account's history when signed in, otherwise the guest
 * history sent by the browser. `exclude` = the product page being looked at.
 */
export async function getRecentlyViewed(locale: string, guest: ViewedItem[], exclude?: string) {
  const own = await backendHistory(await customerToken(), SHELF_SIZE + 1)
  const items = (own ?? cleanItems(guest)).filter((i) => i.productId !== exclude).slice(0, SHELF_SIZE)
  return { signedIn: own !== null, products: (await withProducts(items, locale)).map((e) => e.product) }
}

/** The account's whole history (the "Browsing history" page); empty when signed out. */
export async function listHistory(locale: string): Promise<HistoryEntry[]> {
  return withProducts((await backendHistory(await customerToken(), HISTORY_LIMIT)) ?? [], locale)
}

export async function removeFromHistory(productId: string): Promise<void> {
  const token = await customerToken()
  if (token) await medusa(`/store/customers/me/browsing-history/${encodeURIComponent(productId)}`, { method: "DELETE", token })
}

export async function clearHistory(): Promise<void> {
  const token = await customerToken()
  if (token) await medusa("/store/customers/me/browsing-history", { method: "DELETE", token })
}
