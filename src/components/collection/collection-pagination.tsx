"use client"

import { pageWindow } from "@/components/catalog/catalog-pagination"
import { useQueryState } from "@/hooks/use-query-state"
import { useT } from "@/i18n/client"
import { Link, usePathname } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

/** Centred "‹ 1 2 3 … 10 ›" under the grid, as on vitacost.com collection pages. */
export function CollectionPagination({ page, pageCount }: { page: number; pageCount: number }) {
  const t = useT()
  const pathname = usePathname()
  const { params } = useQueryState()
  if (pageCount <= 1) return null
  const hrefFor = (p: number) => {
    const next = new URLSearchParams(params.toString())
    next.delete("per")
    if (p === 1) next.delete("page")
    else next.set("page", String(p))
    const qs = next.toString()
    return `${pathname}${qs ? `?${qs}` : ""}`
  }
  const arrow = (dir: -1 | 1) => {
    const target = page + dir
    if (target < 1 || target > pageCount) return <span className="w-11" />
    return (
      <Link href={hrefFor(target)} aria-label={dir < 0 ? t("collection.previousPage") : t("collection.nextPage")} className="grid size-11 place-items-center text-[#121212] hover:text-brand">
        <svg viewBox="0 0 6 10" className={cn("h-2.5 w-1.5", dir < 0 && "rotate-180")} aria-hidden="true">
          <path d="M1 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    )
  }
  return (
    <nav aria-label={t("catalog.pagination")} className="flex items-center justify-center py-2.5 text-base text-[#121212]">
      {arrow(-1)}
      {pageWindow(page, pageCount).map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} aria-hidden="true" className="grid h-11 w-8 place-items-center text-[#8a8a8a]">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn("grid size-11 place-items-center", p === page ? "underline underline-offset-4" : "hover:text-brand")}
          >
            {p}
          </Link>
        ),
      )}
      {arrow(1)}
    </nav>
  )
}
