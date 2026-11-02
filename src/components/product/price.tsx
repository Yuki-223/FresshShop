import { formatPrice, discountPercent } from "@/lib/format"
import { cn } from "@/lib/utils"
import { SoftBadge } from "@/components/common/pills"

export function Price({
  price,
  oldPrice,
  size = "md",
  tone = "ink",
  className,
}: {
  price: number
  oldPrice?: number
  size?: "sm" | "md" | "lg"
  tone?: "ink" | "brand"
  className?: string
}) {
  const main = { sm: "text-base", md: "text-lg", lg: "text-2xl" }[size]
  return (
    <div className={cn("flex flex-col", className)}>
      <span className={cn("font-heading font-semibold leading-tight", main, tone === "brand" ? "text-brand" : "text-ink")}>
        {formatPrice(price)}
      </span>
      {oldPrice && (
        <span className="font-heading text-xs font-semibold text-ink-muted line-through">
          {formatPrice(oldPrice, { currency: size === "lg" })}
        </span>
      )}
    </div>
  )
}

export function DiscountBadge({ price, oldPrice, className }: { price: number; oldPrice?: number; className?: string }) {
  const pct = discountPercent(price, oldPrice)
  if (!pct) return null
  return <SoftBadge className={className}>- {pct} %</SoftBadge>
}
