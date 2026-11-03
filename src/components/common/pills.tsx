import { Link } from "@/i18n/navigation"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

/** Small green counter pill (e.g. "117 Products", category counts). */
export function CountPill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-8 items-center justify-center rounded-full bg-brand-soft px-2 font-heading text-xs font-semibold text-brand-dark",
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Grey rounded tag (footer "Product tags", blog tags). */
export function TagChip({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "inline-flex h-7 items-center rounded-xl bg-surface-2 px-3 font-heading text-xs font-semibold text-ink transition-colors hover:bg-brand-soft hover:text-brand-dark",
        className,
      )}
      {...props}
    />
  )
}

/** Light green label used for discount / shipping / blog categories. */
export function SoftBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-xl bg-brand-soft px-2 font-heading text-xs font-semibold text-brand",
        className,
      )}
    >
      {children}
    </span>
  )
}
