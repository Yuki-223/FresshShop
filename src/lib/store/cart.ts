"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { CartItem, ProductSnapshot, Unit } from "@/types"

export const TAX_RATE = 0.17

export const SHIPPING_METHODS = [
  { id: "fedex", name: "FedEx", price: 32 },
  { id: "dhl", name: "DHL", price: 15 },
] as const
export type ShippingMethodId = (typeof SHIPPING_METHODS)[number]["id"]

/** Demo promo codes → percentage off the subtotal. */
const PROMO_CODES: Record<string, number> = { FRESH10: 0.1, FARM20: 0.2 }

interface CartState {
  items: CartItem[]
  promoCode: string | null
  isOpen: boolean
  add: (product: ProductSnapshot, quantity?: number, unit?: Unit) => void
  update: (productId: string, patch: Partial<Pick<CartItem, "quantity" | "unit">>) => void
  remove: (productId: string) => void
  clear: () => void
  applyPromo: (code: string) => boolean
  setOpen: (open: boolean) => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      promoCode: null,
      isOpen: false,
      add: (product, quantity = 1, unit) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === product.productId)
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.productId === product.productId
                  ? { ...i, quantity: i.quantity + quantity, unit: unit ?? i.unit }
                  : i,
              ),
            }
          }
          return { items: [...s.items, { ...product, quantity, unit: unit ?? product.units[0] }] }
        }),
      update: (productId, patch) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId
              ? { ...i, ...patch, quantity: Math.max(1, patch.quantity ?? i.quantity) }
              : i,
          ),
        })),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [], promoCode: null }),
      applyPromo: (code) => {
        const normalized = code.trim().toUpperCase()
        if (!(normalized in PROMO_CODES)) return false
        set({ promoCode: normalized })
        return true
      },
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: "freshnesecom-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, promoCode: s.promoCode }),
    },
  ),
)

export interface CartTotals {
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
  count: number
}

/** Pure pricing function — shared by the cart drawer and checkout summary. */
export function computeTotals(items: CartItem[], promoCode: string | null, shipping = 0): CartTotals {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discount = promoCode ? subtotal * (PROMO_CODES[promoCode] ?? 0) : 0
  const tax = (subtotal - discount) * TAX_RATE
  const round = (n: number) => Math.round(n * 100) / 100
  return {
    subtotal: round(subtotal),
    discount: round(discount),
    tax: round(tax),
    shipping,
    total: round(subtotal - discount + tax + shipping),
    count: items.reduce((n, i) => n + i.quantity, 0),
  }
}
