"use server"

import { isLocale } from "@/i18n/config"
import { suggestProducts } from "@/lib/api"

/** Products for the header search box's drop-down, while the visitor types. */
export async function suggest(term: string, locale: string) {
  if (!isLocale(locale)) return { items: [], total: 0 }
  return suggestProducts(term.slice(0, 100), locale)
}
