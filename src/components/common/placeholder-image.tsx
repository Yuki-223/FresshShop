import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Image slot. The design ships with grey placeholders, so this renders the
 * placeholder surface; drop an <Image> in as children once real assets exist.
 */
export function PlaceholderImage({
  className,
  children,
  label,
}: {
  className?: string
  children?: ReactNode
  label?: string
}) {
  return (
    <div role={label ? "img" : undefined} aria-label={label} className={cn("relative overflow-hidden rounded-xl bg-surface", className)}>
      {children}
    </div>
  )
}
