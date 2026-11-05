"use client"

import { Search } from "lucide-react"
import { useState } from "react"
import { useQueryState } from "@/hooks/use-query-state"
import { useI18n } from "@/i18n/client"
import { SORT_OPTIONS } from "@/lib/search-params"

/**
 * Above the grid on vitacost.com collection pages: a square "Search for products in this collection"
 * box (34px, 1px #7d7d7d border), then "N Products" on the left and "Sort By: Best Selling ⌄" on the right.
 * The search narrows the current category (URL ?q=), the sort writes ?sort= like the original FilterBar.
 */
export function CollectionToolbar({ total }: { total: number }) {
  const { t } = useI18n()
  const { params, set } = useQueryState()
  const [q, setQ] = useState(params.get("q") ?? "")
  const sort = params.get("sort") ?? "popular"

  return (
    <div className="mb-5">
      <form
        role="search"
        className="relative"
        onSubmit={(e) => {
          e.preventDefault()
          set({ q: q.trim() || null })
        }}
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("collection.searchInCollection")}
          aria-label={t("collection.searchInCollection")}
          className="h-[34px] w-full border border-[#7d7d7d] bg-white pr-11 pl-6 text-sm text-black outline-none placeholder:text-[#6b6b6b] focus:border-[#121212]"
        />
        <button type="submit" aria-label={t("header.search")} className="absolute top-0 right-0 grid h-[34px] w-11 place-items-center text-[#121212]">
          <Search className="size-4" strokeWidth={1.75} />
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm tracking-[0.6px] text-[#121212]">
        <p>{t.plural("collection.productCount", total)}</p>
        <label className="flex items-center gap-1.5">
          <span>{t("collection.sortBy")}</span>
          <span className="relative">
            <select
              value={sort}
              onChange={(e) => set({ sort: e.target.value === "popular" ? null : e.target.value })}
              className="cursor-pointer appearance-none bg-transparent pr-5 text-sm text-[#121212] outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.label)}
                </option>
              ))}
            </select>
            <svg viewBox="0 0 10 6" className="pointer-events-none absolute top-1/2 right-0 size-2.5 -translate-y-1/2" aria-hidden="true">
              <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </label>
      </div>
    </div>
  )
}
