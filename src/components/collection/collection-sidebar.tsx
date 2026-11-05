"use client"

import { useState } from "react"
import { useQueryState } from "@/hooks/use-query-state"
import { useI18n } from "@/i18n/client"
import { cn } from "@/lib/utils"
import "./collection.css"

/**
 * Vitacost-style filter sidebar (collection pages, measured on vitacost.com at 1440px):
 * collapsible sections separated by #e8e8e1 rules, 25px vertical padding, a black ▸ caret,
 * 14px headings; checkbox rows with grey "(n)" counts; Brand has a "Search Options" box;
 * Price has two "$" inputs and a range; Review Ratings are green star rows.
 * Same URL parameters as the original FilterSidebar (sub, brand, form, rating, min, max, stock, subscribe, bundle).
 */
interface Facet {
  value: string
  label: string
  count: number
}

function Section({ title, defaultOpen = false, first = false, children }: { title: string; defaultOpen?: boolean; first?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className={cn("border-b border-[#e8e8e1]", first ? "pb-[25px]" : "py-[25px]")}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-[14px] text-left text-sm leading-5 tracking-[0.6px] text-[#121212]"
      >
        <svg viewBox="0 0 10 10" className={cn("size-2.5 shrink-0 transition-transform", open && "rotate-90")} aria-hidden="true">
          <path d="M2 0l6 5-6 5z" fill="currentColor" />
        </svg>
        {title}
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  )
}

function CheckRow({ checked, onChange, count, children }: { checked: boolean; onChange: () => void; count?: number; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-[7px] text-sm leading-[18px] tracking-[0.6px] text-[#121212]">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-[14px] shrink-0 accent-[var(--brand)]" />
      <span className="flex-1">{children}</span>
      {count != null && <span className="text-[#9a9a9a]">({count})</span>}
    </label>
  )
}

function Stars({ n }: { n: number }) {
  return (
    <span aria-hidden="true" className="tracking-[6px] text-[15px]">
      <span className="text-brand">{"★".repeat(n)}</span>
      <span className="text-[#dddddd]">{"★".repeat(5 - n)}</span>
    </span>
  )
}

function PriceSection({ bounds }: { bounds: { min: number; max: number } }) {
  const { t, fmt } = useI18n()
  const { params, set } = useQueryState()
  const fromUrl: [number, number] = [Number(params.get("min") ?? bounds.min), Number(params.get("max") ?? bounds.max)]
  const [range, setRange] = useState<[number, number]>(fromUrl)
  const commit = (r: [number, number]) =>
    set({ min: r[0] > bounds.min ? String(r[0]) : null, max: r[1] < bounds.max ? String(r[1]) : null })
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(bounds.min + (bounds.max - bounds.min) * f))
  const pct = (v: number) => ((v - bounds.min) / Math.max(1, bounds.max - bounds.min)) * 100

  return (
    <div>
      <div className="flex items-center gap-3">
        {[0, 1].map((i) => (
          <label key={i} className="flex h-9 flex-1 items-center gap-2 border border-[#d9d9d9] bg-white px-2.5 text-sm text-[#121212]">
            <span>{fmt.currency === "USD" ? "$" : "¥"}</span>
            <input
              type="number"
              inputMode="decimal"
              aria-label={i === 0 ? t("catalog.min") : t("catalog.max")}
              min={bounds.min}
              max={bounds.max}
              value={range[i]}
              onChange={(e) => {
                const v = Number(e.target.value)
                setRange((r) => (i === 0 ? [v, r[1]] : [r[0], v]))
              }}
              onBlur={() => commit(range)}
              onKeyDown={(e) => e.key === "Enter" && commit(range)}
              className="w-full min-w-0 bg-transparent text-right outline-none"
            />
          </label>
        ))}
      </div>
      {/* two native range inputs stacked on one track */}
      <div className="relative mt-5 h-5">
        <div className="absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 bg-[#121212]" />
        <div className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-brand" style={{ left: `${pct(range[0])}%`, right: `${100 - pct(range[1])}%` }} />
        {[0, 1].map((i) => (
          <input
            key={i}
            type="range"
            aria-label={i === 0 ? t("catalog.min") : t("catalog.max")}
            min={bounds.min}
            max={bounds.max}
            step={1}
            value={range[i]}
            onChange={(e) => {
              const v = Number(e.target.value)
              setRange((r) => (i === 0 ? [Math.min(v, r[1]), r[1]] : [r[0], Math.max(v, r[0])]))
            }}
            onPointerUp={() => commit(range)}
            onKeyUp={() => commit(range)}
            className="vc-range pointer-events-none absolute inset-0 w-full appearance-none bg-transparent"
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-[#121212]">
        {ticks.map((v) => (
          <span key={v}>{v}</span>
        ))}
      </div>
    </div>
  )
}

export function CollectionSidebar({
  categorySlug,
  subcategories,
  brands,
  forms,
  ratings,
  toggles,
  priceBounds,
}: {
  categorySlug: string
  subcategories: Facet[]
  brands: Facet[]
  forms: Facet[]
  ratings: { value: number; count: number }[]
  toggles: { stock: number; subscribe: number; bundle: number }
  priceBounds: { min: number; max: number }
}) {
  const { t } = useI18n()
  const { params, set, toggleInList } = useQueryState()
  const [brandQuery, setBrandQuery] = useState("")
  const sel = (key: string) => params.getAll(key)
  const on = (key: string) => params.get(key) === "1"
  const visibleBrands = brands.filter((b) => b.label.toLowerCase().includes(brandQuery.trim().toLowerCase()))

  return (
    <aside aria-label={t("collection.filters")} className="w-[244px]">
      {subcategories.length > 0 && (
        <Section title={t("collection.category")} first defaultOpen={!!params.get("sub") || categorySlug !== "all"}>
          {subcategories.map((s) => (
            <CheckRow key={s.value} checked={params.get("sub") === s.value} onChange={() => set({ sub: params.get("sub") === s.value ? null : s.value })} count={s.count}>
              {s.label}
            </CheckRow>
          ))}
        </Section>
      )}

      <Section title={t("collection.brand")} first={subcategories.length === 0} defaultOpen={sel("brand").length > 0}>
        <input
          type="search"
          value={brandQuery}
          onChange={(e) => setBrandQuery(e.target.value)}
          placeholder={t("collection.searchOptions")}
          aria-label={t("collection.searchOptions")}
          className="mb-2 h-9 w-full rounded-full border border-[#e3e3e3] bg-[#f6f6f6] px-4 text-[13px] outline-none placeholder:text-[#8a8a8a] focus:border-[#bdbdbd]"
        />
        <div className="max-h-[230px] overflow-y-auto pr-1">
          {visibleBrands.map((b) => (
            <CheckRow key={b.value} checked={sel("brand").includes(b.value)} onChange={() => toggleInList("brand", b.value)} count={b.count}>
              {b.label}
            </CheckRow>
          ))}
        </div>
      </Section>

      <Section title={t("collection.specialties")} defaultOpen={on("subscribe") || on("bundle")}>
        <CheckRow checked={on("subscribe")} onChange={() => set({ subscribe: on("subscribe") ? null : "1" })} count={toggles.subscribe}>
          {t("catalog.subscribe")}
        </CheckRow>
        <CheckRow checked={on("bundle")} onChange={() => set({ bundle: on("bundle") ? null : "1" })} count={toggles.bundle}>
          {t("catalog.bundle")}
        </CheckRow>
      </Section>

      <Section title={t("catalog.price")} defaultOpen>
        <PriceSection key={`${params.get("min")}-${params.get("max")}`} bounds={priceBounds} />
      </Section>

      <Section title={t("collection.availability")} defaultOpen={on("stock")}>
        <CheckRow checked={on("stock")} onChange={() => set({ stock: on("stock") ? null : "1" })} count={toggles.stock}>
          {t("catalog.inStock")}
        </CheckRow>
      </Section>

      <Section title={t("catalog.forms")} defaultOpen={sel("form").length > 0}>
        {forms.map((f) => (
          <CheckRow key={f.value} checked={sel("form").includes(f.value)} onChange={() => toggleInList("form", f.value)} count={f.count}>
            {f.label}
          </CheckRow>
        ))}
      </Section>

      <Section title={t("collection.reviewRatings")} defaultOpen>
        {[...ratings].reverse().map((r) => (
          <CheckRow key={r.value} checked={sel("rating").includes(String(r.value))} onChange={() => toggleInList("rating", String(r.value))} count={r.count}>
            <span className="sr-only">{t("product.ratedOutOf", { value: r.value })}</span>
            <Stars n={r.value} />
          </CheckRow>
        ))}
      </Section>
    </aside>
  )
}
