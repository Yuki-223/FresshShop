"use client"

import { useEffect, useState } from "react"
import { VcCarousel } from "@/components/home/vc-carousel/vc-carousel"
import { useI18n } from "@/i18n/client"
import { getRecentlyViewed } from "@/lib/history/actions"
import { useGuestHistory } from "@/lib/store/history"
import type { Product } from "@/types"

/**
 * "Recently viewed" shelf (homepage and product pages): the newest 10 products of the account's
 * history, or of this browser's guest history when signed out. Hidden while there is nothing to show.
 * Loaded after the page, since it depends on the visitor (cookie / localStorage).
 * `exclude` = the product page being looked at.
 */
export function RecentlyViewed({ exclude, green = false }: { exclude?: string; green?: boolean }) {
  const { t, locale } = useI18n()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    let cancelled = false
    getRecentlyViewed(locale, useGuestHistory.getState().items, exclude)
      .then((r) => !cancelled && setProducts(r.products))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [locale, exclude])

  if (products.length === 0) return null
  return <VcCarousel title={t("history.recentlyViewed")} products={products} green={green} />
}
