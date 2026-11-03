"use client"

import { create } from "zustand"
import { addToCart, applyPromoCode, getCart, removeCartLine, updateCartLine } from "@/lib/cart/actions"
import type { CartView } from "@/lib/cart/types"
import type { CartItem, CartLineInput } from "@/types"

const EMPTY: Omit<CartView, "id"> = { items: [], subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0, count: 0, promoCode: null, carrier: null }

interface CartState {
  /** latest cart from the backend (null until loaded / when there is none) */
  cart: CartView | null
  items: CartItem[]
  promoCode: string | null
  /** true once the first getCart() finished */
  ready: boolean
  pending: boolean
  isOpen: boolean
  refresh: () => Promise<void>
  setCart: (cart: CartView | null) => void
  add: (line: CartLineInput, quantity?: number) => Promise<void>
  setQuantity: (lineId: string, quantity: number) => Promise<void>
  remove: (lineId: string) => Promise<void>
  applyPromo: (code: string) => Promise<boolean>
  /** forget the cart locally (after an order was placed — the server already dropped the cookie) */
  clear: () => void
  setOpen: (open: boolean) => void
}

/**
 * Client view of the backend cart. Every mutation is a server action that returns the
 * recalculated cart, so prices, discounts and totals always come from Medusa.
 */
export const useCart = create<CartState>()((set, get) => {
  const apply = (cart: CartView | null) => set({ cart, items: cart?.items ?? [], promoCode: cart?.promoCode ?? null, ready: true })
  const run = async (fn: () => Promise<CartView | null>) => {
    set({ pending: true })
    try {
      apply(await fn())
    } finally {
      set({ pending: false })
    }
  }
  return {
    cart: null,
    items: [],
    promoCode: null,
    ready: false,
    pending: false,
    isOpen: false,
    refresh: () => run(getCart),
    setCart: apply,
    add: (line, quantity = 1) => {
      if (!line.variantId) return Promise.reject(new Error("This product is not available in the backend"))
      return run(() => addToCart({ variantId: line.variantId!, quantity, purchase: line.purchase }))
    },
    setQuantity: (lineId, quantity) => run(() => updateCartLine(lineId, quantity)),
    remove: (lineId) => run(() => removeCartLine(lineId)),
    applyPromo: async (code) => {
      set({ pending: true })
      try {
        const { ok, cart } = await applyPromoCode(code)
        apply(cart ?? get().cart)
        return ok
      } finally {
        set({ pending: false })
      }
    },
    clear: () => apply(null),
    setOpen: (isOpen) => set({ isOpen }),
  }
})

/** Totals of the current cart (USD). */
export function cartTotals(cart: CartView | null) {
  return cart ? { ...EMPTY, ...cart } : { ...EMPTY }
}

/**
 * Totals converted to the display currency. Each row is converted on its own and the total is
 * their sum, so the rows the customer sees always add up (no 1-cent rounding gaps in CNY).
 */
export function localTotals(cart: CartView | null, toLocal: (usd: number) => number) {
  const t = cartTotals(cart)
  const subtotal = toLocal(t.subtotal)
  const discount = toLocal(t.discount)
  const shipping = toLocal(t.shipping)
  const tax = toLocal(t.tax)
  return { subtotal, discount, shipping, tax, total: Math.round((subtotal - discount + shipping + tax) * 100) / 100, count: t.count }
}
