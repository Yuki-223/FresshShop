"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { CartItem, ProductSnapshot, Unit } from "@/types"

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
                i.productId === product.productId ? { ...i, quantity: i.quantity + quantity, unit: unit ?? i.unit } : i,
              ),
            }
          }
          return { items: [...s.items, { ...product, quantity, unit: unit ?? product.units[0] }] }
        }),
      update: (productId, patch) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId ? { ...i, ...patch, quantity: Math.max(1, patch.quantity ?? i.quantity) } : i,
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
      // v2: product text is stored in every language ({ en, zh }); older carts are dropped
      version: 2,
      migrate: () => ({ items: [], promoCode: null }),
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, promoCode: s.promoCode }),
    },
  ),
)

export interface CartTotals {
  subtotal: number
  discount: number
  tax: number
  taxRate: number
  shipping: number
  total: number
  count: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Pure pricing function shared by the cart drawer and the checkout summary.
 * Every amount is in the display currency: unit prices are converted with `toLocal`
 * first, so the rows the user sees always add up to the total.
 */
export function computeTotals(
  items: CartItem[],
  promoCode: string | null,
  opts: { toLocal: (base: number) => number; shipping?: number; taxRate?: number },
): CartTotals {
  const { toLocal, shipping = 0, taxRate = 0 } = opts
  const subtotal = round2(items.reduce((sum, i) => sum + toLocal(i.price) * i.quantity, 0))
  const discount = round2(promoCode ? subtotal * (PROMO_CODES[promoCode] ?? 0) : 0)
  const tax = round2((subtotal - discount) * taxRate)
  return {
    subtotal,
    discount,
    tax,
    taxRate,
    shipping,
    total: round2(subtotal - discount + tax + shipping),
    count: items.reduce((n, i) => n + i.quantity, 0),
  }
}
