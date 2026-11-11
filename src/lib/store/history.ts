"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ViewedItem } from "@/lib/history/types"
import { HISTORY_LIMIT } from "@/lib/history/types"

interface GuestHistoryState {
  /** newest first, one entry per product */
  items: ViewedItem[]
  add: (productId: string) => void
  clear: () => void
}

/**
 * A guest's "recently viewed" products, kept in this browser (localStorage). When the visitor
 * signs in, the list is merged into their account (lib/history/actions.ts) and emptied here.
 * Signed-in views go straight to the backend and never land here.
 */
export const useGuestHistory = create<GuestHistoryState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId) =>
        set((s) => ({
          items: [{ productId, viewedAt: new Date().toISOString() }, ...s.items.filter((i) => i.productId !== productId)].slice(0, HISTORY_LIMIT),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "freshshop-history", version: 1 },
  ),
)
