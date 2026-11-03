"use client"

import { SoftBadge } from "@/components/common/pills"
import { useFormat, useT } from "@/i18n/client"
import { cn } from "@/lib/utils"

/**
 * Current price with an optional struck-through reference price below it.
 * `price`/`oldPrice` are base (USD) unit prices; conversion and currency come from the locale.
 */
export function Price({
  price,
  oldPrice,
  quantity = 1,
  from,
  size = "md",
  tone = "ink",
  className,
}: {
  price: number
  oldPrice?: number
  quantity?: number
  /** prefix with "From" when variants have different prices */
  from?: boolean
  size?: "sm" | "md" | "lg"
  tone?: "ink" | "brand"
  className?: string
}) {
  const fmt = useFormat()
  const t = useT()
  const main = { sm: "text-base", md: "text-lg", lg: "text-2xl" }[size]
  return (
    <div className={cn("flex flex-col", className)}>
      <span className={cn("font-heading font-semibold leading-tight", main, tone === "brand" ? "text-brand" : "text-ink")}>
        {from && <span className="mr-1 text-xs font-medium text-ink-muted">{t("product.from")}</span>}
        {fmt.price(price, quantity)}
      </span>
      {oldPrice != null && oldPrice > price && (
        <span className="font-heading text-xs font-semibold text-ink-muted line-through">{fmt.price(oldPrice, quantity, { bare: size !== "lg" })}</span>
      )}
    </div>
  )
}

/** "Save 20%" badge for subscription savings. Renders nothing when there is no saving. */
export function SaveBadge({ percent, className }: { percent: number; className?: string }) {
  const t = useT()
  if (!percent) return null
  return <SoftBadge className={className}>{t("product.save", { percent })}</SoftBadge>
}
