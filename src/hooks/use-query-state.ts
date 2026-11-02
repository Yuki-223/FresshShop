"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"

type Value = string | string[] | null | undefined

/**
 * Read/write helpers for URL search params. Any filter change resets
 * pagination so users never land on an empty page.
 */
export function useQueryState() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const set = useCallback(
    (patch: Record<string, Value>, opts: { resetPage?: boolean } = { resetPage: true }) => {
      const next = new URLSearchParams(params.toString())
      for (const [key, value] of Object.entries(patch)) {
        next.delete(key)
        if (value == null || value === "") continue
        for (const v of Array.isArray(value) ? value : [value]) next.append(key, v)
      }
      if (opts.resetPage) {
        next.delete("page")
        next.delete("per")
      }
      const qs = next.toString()
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
    },
    [params, pathname, router],
  )

  const toggleInList = useCallback(
    (key: string, value: string) => {
      const current = params.getAll(key)
      set({ [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] })
    },
    [params, set],
  )

  return { params, set, toggleInList, isPending }
}
