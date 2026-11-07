import { redirect } from "next/navigation"
import { localizeHref } from "@/i18n/config"
import { getI18n } from "@/i18n/server"
import { getCustomer } from "./actions"
import type { Customer } from "./types"

/** Where to go after signing in: only paths inside this store ("/account/orders", "/checkout"). */
export function safeNext(value: unknown, fallback = "/account/orders") {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : fallback
}

/** The signed-in customer; signed-out visitors are sent to the sign-in page and come back to `next` afterwards. */
export async function requireCustomer(next: string): Promise<Customer> {
  const customer = await getCustomer()
  if (customer) return customer
  const { locale } = await getI18n()
  redirect(localizeHref(`/account/login?next=${encodeURIComponent(next)}`, locale))
}
