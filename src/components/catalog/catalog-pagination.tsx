"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CountPill } from "@/components/common/pills"
import { useQueryState } from "@/hooks/use-query-state"
import { useT } from "@/i18n/client"
import { Link, usePathname } from "@/i18n/navigation"
import { PAGE_SIZE } from "@/lib/search-params"
import { cn } from "@/lib/utils"

/** "Page: 1 2 3 4   [Show more products ⌄]   336 Products" */
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
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn("px-1 font-heading font-semibold", p === page ? "text-ink" : "text-brand hover:underline")}
          >
            {p}
          </Link>
        ))}
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
