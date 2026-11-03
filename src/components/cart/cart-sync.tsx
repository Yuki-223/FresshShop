"use client"

import { useEffect } from "react"
import { useCart } from "@/lib/store/cart"

/** Loads the backend cart once when the app starts. */
export function CartSync() {
  const refresh = useCart((s) => s.refresh)
  useEffect(() => {
    void refresh()
  }, [refresh])
  return null
}
