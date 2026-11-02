"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ToggleListState {
  ids: string[]
  toggle: (id: string) => boolean
  has: (id: string) => boolean
}

function createToggleList(name: string) {
  return create<ToggleListState>()(
    persist(
      (set, get) => ({
        ids: [],
        toggle: (id) => {
          const added = !get().ids.includes(id)
          set((s) => ({ ids: added ? [...s.ids, id] : s.ids.filter((x) => x !== id) }))
          return added
        },
        has: (id) => get().ids.includes(id),
      }),
      { name },
    ),
  )
}

export const useWishlist = createToggleList("freshnesecom-wishlist")
export const useCompare = createToggleList("freshnesecom-compare")
