"use client"

import { useState } from "react"
import { CountPill } from "@/components/common/pills"
import { Rating } from "@/components/product/rating"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useQueryState } from "@/hooks/use-query-state"
import { useI18n } from "@/i18n/client"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

interface Facet {
  value: string
  label: string
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

function CheckRow({ id, checked, onChange, children }: { id: string; checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} className="size-[18px] rounded-[4px] bg-surface" />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal text-ink">
        {children}
      </Label>
    </div>
  )
}

/** Price bounds are in the display currency of the current locale (¥ or USD). */
function PriceFilter({ min, max, bounds }: { min?: number; max?: number; bounds: { min: number; max: number } }) {
  const { t, fmt } = useI18n()
  const { set } = useQueryState()
  const [range, setRange] = useState<[number, number]>([min ?? bounds.min, max ?? bounds.max])
  const labels = [t("catalog.min"), t("catalog.max")]

  return (
    <FilterGroup title={t("catalog.price")}>
      <Slider
        min={bounds.min}
        max={bounds.max}
        step={1}
        value={range}
        onValueChange={(v) => setRange(v as [number, number])}
        className="[&_[data-slot=slider-range]]:bg-brand [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border-line"
        aria-label={t("catalog.priceRange")}
      />
      <div className="mt-6 flex items-end gap-3">
        {labels.map((label, i) => (
          <div key={label} className="flex-1">
            <Label htmlFor={`price-${i}`} className="mb-1 font-heading text-xs font-semibold text-ink">
              {label} <span className="font-normal text-ink-muted">({fmt.currency})</span>
            </Label>
            <Input
              id={`price-${i}`}
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
          {t("catalog.apply")}
        </Button>
        <Button
          variant="link"
          className="text-ink-muted"
          onClick={() => {
            setRange([bounds.min, bounds.max])
            set({ min: null, max: null })
          }}
        >
          {t("catalog.reset")}
        </Button>
      </div>
    </FilterGroup>
  )
}

export function FilterSidebar({
  categorySlug,
  subcategories,
  brands,
  forms,
  priceBounds,
}: {
  categorySlug: string
  subcategories: Facet[]
  brands: Facet[]
  forms: Facet[]
  priceBounds: { min: number; max: number }
}) {
  const { t } = useI18n()
  const { params, toggleInList } = useQueryState()
  const activeSub = params.get("sub")
  const selectedBrands = params.getAll("brand")
  const selectedForms = params.getAll("form")
  const selectedRatings = params.getAll("rating")
  const min = params.get("min")
  const max = params.get("max")

  return (
    <aside>
      {subcategories.length > 0 && (
        <FilterGroup title={t("catalog.categories")}>
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
                    {s.label}
                    <CountPill>{s.count}</CountPill>
                  </Link>
                </li>
              )
            })}
          </ul>
        </FilterGroup>
      )}

      <FilterGroup title={t("catalog.brands")}>
        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
          {brands.map((b) => (
            <CheckRow key={b.value} id={`brand-${b.value}`} checked={selectedBrands.includes(b.value)} onChange={() => toggleInList("brand", b.value)}>
              {b.label} <span className="text-ink-muted">({b.count})</span>
            </CheckRow>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={t("catalog.forms")}>
        <div className="space-y-3">
          {forms.map((f) => (
            <CheckRow key={f.value} id={`form-${f.value}`} checked={selectedForms.includes(f.value)} onChange={() => toggleInList("form", f.value)}>
              {f.label} <span className="text-ink-muted">({f.count})</span>
            </CheckRow>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={t("catalog.rating")}>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((r) => (
            <CheckRow key={r} id={`rating-${r}`} checked={selectedRatings.includes(String(r))} onChange={() => toggleInList("rating", String(r))}>
              <Rating value={r} tone="gold" />
            </CheckRow>
          ))}
        </div>
      </FilterGroup>

      <PriceFilter key={`${min}-${max}`} min={min ? Number(min) : undefined} max={max ? Number(max) : undefined} bounds={priceBounds} />
    </aside>
  )
}
