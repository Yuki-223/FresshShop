"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useT } from "@/i18n/client"
import { cn } from "@/lib/utils"
import type { Unit } from "@/types"

/** "[ 1 | Pcs ⌄ ]" control used on detail page, cart drawer and checkout summary. */
export function QuantityUnitSelector({
  quantity,
  unit,
  units,
  onQuantityChange,
  onUnitChange,
  size = "md",
  className,
}: {
  quantity: number
  unit: Unit
  units: Unit[]
  onQuantityChange: (q: number) => void
  onUnitChange: (u: Unit) => void
  size?: "sm" | "md"
  className?: string
}) {
  const t = useT()
  const unitLabel = (u: Unit) => t(`units.${u}`)
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-line bg-surface",
        size === "sm" ? "h-8" : "h-11",
        className,
      )}
    >
      <input
        type="number"
        min={1}
        max={999}
        inputMode="numeric"
        aria-label={t("product.quantity")}
        value={quantity}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          if (!Number.isNaN(n)) onQuantityChange(Math.min(999, Math.max(1, n)))
        }}
        className={cn(
          "h-full bg-transparent text-center text-sm text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
          size === "sm" ? "w-9" : "w-12",
        )}
      />
      <span className="h-1/2 w-px bg-line" />
      <Select value={unit} onValueChange={(v) => v && onUnitChange(v as Unit)} disabled={units.length < 2}>
        <SelectTrigger
          aria-label={t("product.unit")}
          className={cn(
            "h-full border-0 bg-transparent font-heading text-xs font-bold shadow-none focus-visible:ring-0",
            size === "sm" ? "px-2" : "px-3",
          )}
        >
          <SelectValue>{(v: Unit) => unitLabel(v)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {units.map((u) => (
            <SelectItem key={u} value={u}>
              {unitLabel(u)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
