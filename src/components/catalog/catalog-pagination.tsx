"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CountPill } from "@/components/common/pills"
import { useQueryState } from "@/hooks/use-query-state"
import { useT } from "@/i18n/client"
import { Link, usePathname } from "@/i18n/navigation"
import { PAGE_SIZE } from "@/lib/search-params"
import { cn } from "@/lib/utils"

/**
 * Page numbers to show: first, last and two either side of the current page, with gaps (null)
 * in between — "1 2 3 4 5 … 26". All 26 numbers didn't fit the left third of the row.
 */
export function pageWindow(page: number, pageCount: number): (number | null)[] {
  const keep = new Set([1, pageCount])
  for (let p = page - 2; p <= page + 2; p++) if (p >= 1 && p <= pageCount) keep.add(p)
  // near either end, keep five numbers in a row so the list doesn't shrink
  if (page <= 3) for (let p = 1; p <= Math.min(5, pageCount); p++) keep.add(p)
  if (page >= pageCount - 2) for (let p = Math.max(1, pageCount - 4); p <= pageCount; p++) keep.add(p)
  const sorted = [...keep].sort((a, b) => a - b)
  const out: (number | null)[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(p - sorted[i - 1] === 2 ? p - 1 : null)
    out.push(p)
  })
  return out
}

/** "Page: 1 2 3 … 26   [Show more products ⌄]   336 Products" */
export function CatalogPagination({
  page,
  pageCount,
  pageSize,
  total,
}: {
  page: number
  pageCount: number
  pageSize: number
  total: number
}) {
  const t = useT()
  const pathname = usePathname()
  const { params, set, isPending } = useQueryState()
  const hrefFor = (p: number) => {
    const next = new URLSearchParams(params.toString())
    next.delete("per")
    if (p === 1) next.delete("page")
    else next.set("page", String(p))
    const qs = next.toString()
    return `${pathname}${qs ? `?${qs}` : ""}`
  }
  const shown = Math.min(total, page * pageSize)
  const canShowMore = shown < total

  return (
    <div className="mt-16 grid grid-cols-3 items-center">
      <nav aria-label={t("catalog.pagination")} className="flex items-center gap-2 text-xs">
        <span className="text-ink-muted">{t("catalog.page")}</span>
        {pageWindow(page, pageCount).map((p, i) =>
          p === null ? (
            <span key={`gap-${i}`} aria-hidden="true" className="px-0.5 text-ink-muted">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={hrefFor(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn("px-1 font-heading font-semibold", p === page ? "text-ink" : "text-brand hover:underline")}
            >
              {p}
            </Link>
          ),
        )}
      </nav>
      <div className="flex justify-center">
        {canShowMore && (
          <Button
            disabled={isPending}
            onClick={() =>
              // "load more": collapse to page 1 with a bigger page that includes everything shown so far
              set({ page: null, per: String(Math.min(60, shown + PAGE_SIZE)) }, { resetPage: false })
            }
          >
            {isPending ? `${t("common.loading")}…` : t("catalog.showMore")}
            <ChevronDown className="size-4" />
          </Button>
        )}
      </div>
      <p className="flex items-center justify-end gap-1.5 text-xs text-ink-muted">
        <CountPill>{total}</CountPill> {t("catalog.productsLabel")}
      </p>
    </div>
  )
}
