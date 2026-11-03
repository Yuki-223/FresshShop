"use client"

import { SoftBadge } from "@/components/common/pills"
import { useFormat } from "@/i18n/client"
import { cn } from "@/lib/utils"

/**
 * Current price with the struck-through original price below it.
 * `price`/`oldPrice` are base (USD) unit prices; conversion and currency come from the locale.
 */
export function Price({
  price,
  oldPrice,
  quantity = 1,
  size = "md",
  tone = "ink",
  className,
}: {
  price: number
  oldPrice?: number
  quantity?: number
  size?: "sm" | "md" | "lg"
  tone?: "ink" | "brand"
  className?: string
}) {
  const fmt = useFormat()
  const main = { sm: "text-base", md: "text-lg", lg: "text-2xl" }[size]
  return (
    <div className={cn("flex flex-col", className)}>
      <span className={cn("font-heading font-semibold leading-tight", main, tone === "brand" ? "text-brand" : "text-ink")}>
        {fmt.price(price, quantity)}
      </span>
      {oldPrice && (
        <span className="font-heading text-xs font-semibold text-ink-muted line-through">
          {fmt.price(oldPrice, quantity, { bare: size !== "lg" })}
        </span>
      )}
    </div>
  )
}

/** "- 36 %" (en) / "6.4折" (zh). Renders nothing when the product isn't discounted. */
export function DiscountBadge({ price, oldPrice, className }: { price: number; oldPrice?: number; className?: string }) {
  const label = useFormat().discount(price, oldPrice)
  if (!label) return null
  return <SoftBadge className={className}>{label}</SoftBadge>
}
