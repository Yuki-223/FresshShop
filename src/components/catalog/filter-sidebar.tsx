"use client"

import Link from "next/link"
import { useState } from "react"
import { CountPill } from "@/components/common/pills"
import { Rating } from "@/components/product/rating"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useQueryState } from "@/hooks/use-query-state"
import { cn } from "@/lib/utils"

interface Facet {
  value: string
  count: number
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h3 className="mb-4 text-lg font-semibold text-ink">{title}</h3>
      {children}
    </section>
  )
}

function CheckRow({
  id,
  checked,
  onChange,
  children,
}: {
  id: string
  checked: boolean
  onChange: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} className="size-[18px] rounded-[4px] bg-surface" />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal text-ink">
        {children}
      </Label>
    </div>
  )
}

function PriceFilter({ min, max, bounds }: { min?: number; max?: number; bounds: { min: number; max: number } }) {
  const { set } = useQueryState()
  const [range, setRange] = useState<[number, number]>([min ?? bounds.min, max ?? bounds.max])

  return (
    <FilterGroup title="Price">
      <Slider
        min={bounds.min}
        max={bounds.max}
        step={1}
        value={range}
        onValueChange={(v) => setRange(v as [number, number])}
        className="[&_[data-slot=slider-range]]:bg-brand [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border-line"
        aria-label="Price range"
      />
      <div className="mt-6 flex items-end gap-3">
        {(["Min", "Max"] as const).map((label, i) => (
          <div key={label} className="flex-1">
            <Label htmlFor={`price-${label}`} className="mb-1 font-heading text-xs font-semibold text-ink">
              {label}
            </Label>
            <Input
              id={`price-${label}`}
              type="number"
              inputMode="decimal"
              min={bounds.min}
              max={bounds.max}
              value={range[i]}
              onChange={(e) => {
                const v = Number(e.target.value)
                setRange((r) => (i === 0 ? [v, r[1]] : [r[0], v]))
              }}
              className="h-10 rounded-xl bg-surface"
            />
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-8">
        <Button
          onClick={() =>
            set({
              min: range[0] > bounds.min ? String(range[0]) : null,
              max: range[1] < bounds.max ? String(range[1]) : null,
            })
          }
        >
          Apply
        </Button>
        <Button
          variant="link"
          className="text-ink-muted"
          onClick={() => {
            setRange([bounds.min, bounds.max])
            set({ min: null, max: null })
          }}
        >
          Reset
        </Button>
      </div>
    </FilterGroup>
  )
}

export function FilterSidebar({
  categorySlug,
  subcategories,
  brands,
  priceBounds,
}: {
  categorySlug: string
  subcategories: Facet[]
  brands: Facet[]
  priceBounds: { min: number; max: number }
}) {
  const { params, toggleInList } = useQueryState()
  const activeSub = params.get("sub")
  const selectedBrands = params.getAll("brand")
  const selectedRatings = params.getAll("rating")
  const min = params.get("min")
  const max = params.get("max")

  return (
    <aside>
      {subcategories.length > 0 && (
        <FilterGroup title="Categories">
          <ul className="space-y-2">
            {subcategories.map((s) => {
              const active = activeSub === s.value
              const next = new URLSearchParams(params.toString())
              next.delete("page")
              if (active) next.delete("sub")
              else next.set("sub", s.value)
              return (
                <li key={s.value}>
                  <Link
                    href={`/category/${categorySlug}?${next.toString()}`}
                    scroll={false}
                    className={cn("flex items-center justify-between text-sm text-ink hover:text-brand", active && "font-semibold text-brand")}
                  >
                    {s.value}
                    <CountPill>{s.count}</CountPill>
                  </Link>
                </li>
              )
            })}
          </ul>
        </FilterGroup>
      )}

      <FilterGroup title="Brands">
        <div className="space-y-3">
          {brands.map((b) => (
            <CheckRow
              key={b.value}
              id={`brand-${b.value}`}
              checked={selectedBrands.includes(b.value)}
              onChange={() => toggleInList("brand", b.value)}
            >
              {b.value} <span className="text-ink-muted">({b.count})</span>
            </CheckRow>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Rating">
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((r) => (
            <CheckRow
              key={r}
              id={`rating-${r}`}
              checked={selectedRatings.includes(String(r))}
              onChange={() => toggleInList("rating", String(r))}
            >
              <Rating value={r} tone="gold" />
            </CheckRow>
          ))}
        </div>
      </FilterGroup>

      <PriceFilter
        key={`${min}-${max}`}
        min={min ? Number(min) : undefined}
        max={max ? Number(max) : undefined}
        bounds={priceBounds}
      />
    </aside>
  )
}
