"use client"

import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/** True only after hydration — use to gate UI that reads persisted (localStorage) state. */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
