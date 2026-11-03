"use client"

import { Star } from "lucide-react"
import { useT } from "@/i18n/client"
import { cn } from "@/lib/utils"

/**
 * 5-star rating. `tone="ink"` matches product cards (black stars),
 * `tone="gold"` matches detail page & filters (yellow stars).
 */
export function Rating({
  value,
  tone = "ink",
  size = "sm",
  className,
}: {
  value: number
  tone?: "ink" | "gold"
  size?: "xs" | "sm" | "md"
  className?: string
}) {
  const t = useT()
  const px = { xs: "size-3", sm: "size-3.5", md: "size-4" }[size]
  const filled = tone === "gold" ? "fill-star text-star" : "fill-ink text-ink"
  return (
    <div className={cn("flex items-center gap-0.5", className)} role="img" aria-label={t("product.ratedOutOf", { value })}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn(px, i < value ? filled : "fill-transparent text-line")} strokeWidth={1.5} />
      ))}
    </div>
  )
}
