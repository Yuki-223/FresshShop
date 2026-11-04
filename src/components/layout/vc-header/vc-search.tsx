"use client"

import { Search } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { useT } from "@/i18n/client"
import { useRouter } from "@/i18n/navigation"

/** Long rounded search box (Vitacost style): searches the whole catalog. */
export function VcSearch() {
  const t = useT()
  const router = useRouter()
  const [q, setQ] = useState(useSearchParams().get("q") ?? "")
  return (
    <form
      className="vch__search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        const term = q.trim()
        router.push(term ? `/category/all?q=${encodeURIComponent(term)}` : "/category/all")
      }}
    >
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("nav.searchPlaceholder")} aria-label={t("header.searchLabel")} />
      <button type="submit" aria-label={t("header.search")}>
        <Search className="size-5" strokeWidth={1.6} />
      </button>
    </form>
  )
}

/** Prerendered shell (search params are request-time). */
export function VcSearchFallback() {
  const t = useT()
  return (
    <form className="vch__search" role="search">
      <input type="search" placeholder={t("nav.searchPlaceholder")} aria-label={t("header.searchLabel")} readOnly />
      <button type="button" aria-label={t("header.search")}>
        <Search className="size-5" strokeWidth={1.6} />
      </button>
    </form>
  )
}
