"use client"

import { Minus, Plus } from "lucide-react"
import { useT } from "@/i18n/client"
import { cn } from "@/lib/utils"

/** "[ − 1 + ]" stepper used on the detail page, cart drawer and checkout summary. */
export function QuantitySelector({
  value,
  onChange,
  size = "md",
  className,
}: {
  value: number
  onChange: (q: number) => void
  size?: "sm" | "md"
  className?: string
}) {
  const t = useT()
  const set = (n: number) => onChange(Math.min(99, Math.max(1, n)))
  const btn = cn("grid h-full place-items-center text-ink-soft hover:text-ink disabled:opacity-30", size === "sm" ? "w-7" : "w-9")
  return (
    <div className={cn("inline-flex items-center rounded-xl border border-line bg-surface", size === "sm" ? "h-8" : "h-11", className)}>
      <button type="button" className={btn} onClick={() => set(value - 1)} disabled={value <= 1} aria-label="−">
        <Minus className="size-3.5" />
      </button>
      <input
        type="number"
        min={1}
        max={99}
        inputMode="numeric"
        aria-label={t("product.quantity")}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          if (!Number.isNaN(n)) set(n)
        }}
        className={cn(
          "h-full bg-transparent text-center text-sm text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
          size === "sm" ? "w-7" : "w-9",
        )}
      />
      <button type="button" className={btn} onClick={() => set(value + 1)} disabled={value >= 99} aria-label="+">
        <Plus className="size-3.5" />
      </button>
    </div>
  )
}
