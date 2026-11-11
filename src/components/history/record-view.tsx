"use client"

import { useEffect } from "react"
import { recordView } from "@/lib/history/actions"
import { useGuestHistory } from "@/lib/store/history"

/** Put on a product page: adds the product to the account's history, or to this browser's guest history when signed out. */
export function RecordView({ productId }: { productId?: string }) {
  useEffect(() => {
    if (!productId) return
    recordView(productId)
      .then((saved) => {
        if (!saved) useGuestHistory.getState().add(productId)
      })
      .catch(() => useGuestHistory.getState().add(productId))
  }, [productId])
  return null
}
