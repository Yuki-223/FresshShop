"use client"

import { LayoutGrid, List, X } from "lucide-react"
import { CountPill } from "@/components/common/pills"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQueryState } from "@/hooks/use-query-state"
import { useI18n } from "@/i18n/client"
import type { MessageKey } from "@/i18n/dictionary"
import { SORT_OPTIONS, type ViewMode } from "@/lib/search-params"
import { cn } from "@/lib/utils"

const TOGGLES: { key: "stock" | "subscribe" | "bundle"; label: MessageKey }[] = [
  { key: "stock", label: "catalog.inStock" },
  { key: "subscribe", label: "catalog.subscribe" },
  { key: "bundle", label: "catalog.bundle" },
]

/** Row of quick-filter chips + sort select under the page title. */
export function FilterBar({ counts }: { counts: Record<(typeof TOGGLES)[number]["key"], number> }) {
  const { t } = useI18n()
  const { params, set } = useQueryState()
  const sort = params.get("sort") ?? "popular"
  const sortLabels = Object.fromEntries(SORT_OPTIONS.map((o) => [o.value, t(o.label)]))

  return (
    <div className="flex flex-wrap items-center gap-3">
      {TOGGLES.map((tg) => {
        const on = params.get(tg.key) === "1"
        return (
          <div
            key={tg.key}
            className={cn(
              "flex h-9 items-center gap-2.5 rounded-xl border border-line bg-surface pl-3 text-sm text-ink transition-colors hover:border-brand-light",
              on && "border-brand-light bg-brand-soft",
            )}
          >
            <Checkbox id={`toggle-${tg.key}`} checked={on} onCheckedChange={() => set({ [tg.key]: on ? null : "1" })} className="size-[18px]" />
            <label htmlFor={`toggle-${tg.key}`} className="flex cursor-pointer items-center gap-2.5 self-stretch pr-3">
              {t(tg.label)}
              <CountPill className="bg-surface-2 text-ink">{counts[tg.key]}</CountPill>
            </label>
          </div>
        )
      })}
      <div className="flex h-9 items-center gap-2 rounded-xl border border-line bg-surface pl-3 text-sm text-ink">
        {t("catalog.sortBy")}
        <span className="h-4 w-px bg-line" />
        <Select value={sort} onValueChange={(v) => v && set({ sort: v === "popular" ? null : v })}>
          <SelectTrigger aria-label={t("catalog.sort")} className="h-full border-0 bg-transparent font-heading text-xs font-bold shadow-none focus-visible:ring-0">
            <SelectValue>{(v: string) => sortLabels[v]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {t(o.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

/** "Applied filtres: [x] [x]" chips derived from the URL. Labels for keys come from the facets. */
export function AppliedFilters({ labels }: { labels: Record<string, string> }) {
  const { t, fmt } = useI18n()
  const { params, set } = useQueryState()
  const chips: { label: string; remove: () => void }[] = []
  const label = (key: string) => labels[key] ?? key

  const q = params.get("q")
  if (q) chips.push({ label: `“${q}”`, remove: () => set({ q: null }) })
  const sub = params.get("sub")
  if (sub) chips.push({ label: label(sub), remove: () => set({ sub: null }) })
  for (const b of params.getAll("brand"))
    chips.push({ label: label(b), remove: () => set({ brand: params.getAll("brand").filter((x) => x !== b) }) })
  for (const f of params.getAll("form"))
    chips.push({ label: label(f), remove: () => set({ form: params.getAll("form").filter((x) => x !== f) }) })
  for (const r of params.getAll("rating"))
    chips.push({
      label: t.plural("catalog.ratingChip", Number(r), { next: Number(r) === 5 ? 5 : `${r}.9` }),
      remove: () => set({ rating: params.getAll("rating").filter((x) => x !== r) }),
    })
  const min = params.get("min")
  const max = params.get("max")
  if (min || max)
    chips.push({ label: `${fmt.amount(Number(min ?? 0))} – ${max ? fmt.amount(Number(max)) : "∞"}`, remove: () => set({ min: null, max: null }) })
  for (const tg of TOGGLES) if (params.get(tg.key) === "1") chips.push({ label: t(tg.label), remove: () => set({ [tg.key]: null }) })

  if (!chips.length) return null
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
      <span className="font-heading font-semibold text-ink-muted">{t("catalog.appliedFilters")}</span>
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={c.remove}
          className="inline-flex h-6 items-center gap-1 rounded-xl bg-brand-soft px-2 font-heading font-semibold text-brand hover:bg-brand-light/30"
        >
          {c.label}
          <X className="size-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => set(Object.fromEntries(["q", "sub", "brand", "form", "rating", "min", "max", ...TOGGLES.map((tg) => tg.key)].map((k) => [k, null])))}
        className="ml-2 text-ink-muted underline hover:text-ink"
      >
        {t("catalog.clearAll")}
      </button>
    </div>
  )
}

export function ViewToggle({ view, total }: { view: ViewMode; total: number }) {
  const { t } = useI18n()
  const { set } = useQueryState()
  const item = (mode: ViewMode, Icon: typeof List, label: string) => (
    <button
      type="button"
      aria-pressed={view === mode}
      onClick={() => set({ view: mode === "grid" ? null : mode }, { resetPage: false })}
      className={cn("flex items-center gap-1.5 text-xs", view === mode ? "text-ink" : "text-ink-muted hover:text-ink")}
    >
      <Icon className={cn("size-4", view === mode && "text-brand")} strokeWidth={1.5} />
      {label}
    </button>
  )
  return (
    <div className="flex items-center gap-6">
      {item("grid", LayoutGrid, t("catalog.gridView"))}
      {item("list", List, t("catalog.listView"))}
      <span className="flex items-center gap-1.5 text-xs text-ink-muted">
        <CountPill>{total}</CountPill> {t("catalog.productsLabel")}
      </span>
    </div>
  )
}
