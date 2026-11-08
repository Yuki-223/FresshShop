"use client"

import { Search } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import { useQueryState } from "@/hooks/use-query-state"
import { useI18n } from "@/i18n/client"
import { SORT_OPTIONS, type ViewMode } from "@/lib/search-params"
import { cn } from "@/lib/utils"

/**
 * Above the grid on vitacost.com collection pages (Boost Commerce, measured at 1440px):
 * - a square "Search for products in this collection" box: 34px, 1px #7d7d7d border, 14px text,
 *   padding 8/44/8/24, placeholder #7a7a7a, 16px magnifier 22px from the right edge;
 * - "N Products" (14px, letter-spacing 0.6px) on the left;
 * - "Sort by: Best selling ⌄" on the right (14px, no letter-spacing). It opens a white 250px panel
 *   10px below, right-aligned, 1px #eee border, 5px padding, no shadow; options are 34px rows
 *   (14px, padding 9px 20px), the current one and the hovered one underlined.
 * The search narrows the current category (URL ?q=), the sort writes ?sort= like the original FilterBar.
 * Our addition: grid / list view icons after the sort (?view=list; kept by paging, filters and sort).
 */
export function CollectionToolbar({ total }: { total: number }) {
  const { t } = useI18n()
  const { params, set } = useQueryState()
  const [q, setQ] = useState(params.get("q") ?? "")
  const sort = params.get("sort") ?? "popular"
  const current = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0]

  return (
    <div className="mb-5">
      <form
        role="search"
        className="relative"
        onSubmit={(e) => {
          e.preventDefault()
          set({ q: q.trim() || null })
        }}
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("collection.searchInCollection")}
          aria-label={t("collection.searchInCollection")}
          className="h-[34px] w-full border border-[#7d7d7d] bg-white py-2 pr-11 pl-6 text-sm leading-5 text-black outline-none placeholder:text-[#7a7a7a] focus:border-[#121212]"
        />
        <button type="submit" aria-label={t("header.search")} className="absolute inset-y-0 right-0 flex w-[42px] items-center pr-[18px] pl-1 text-black">
          <Search className="size-4" strokeWidth={1.75} />
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm text-[#121212]">
        <p className="leading-[25.2px] tracking-[0.6px]">{t.plural("collection.productCount", total)}</p>
        <div className="flex items-center gap-[22px]">
          <SortMenu
            label={t("collection.sortBy")}
            value={current.value}
            options={SORT_OPTIONS.map((o) => ({ value: o.value, label: t(o.label) }))}
            onChange={(value) => set({ sort: value === "popular" ? null : value })}
          />
          <ViewSwitch view={params.get("view") === "list" ? "list" : "grid"} onChange={(v) => set({ view: v === "grid" ? null : v }, { resetPage: false })} />
        </div>
      </div>
    </div>
  )
}

function SortMenu({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()
  const current = options.find((o) => o.value === value) ?? options[0]

  // a click outside or Esc closes the panel
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    // move focus to the selected option so the arrow keys work straight away
    listRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus()
    return () => {
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  const moveFocus = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return
    e.preventDefault()
    const items = [...(listRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])]
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus()
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className="flex items-center leading-5 text-[#121212]"
      >
        <span>{label}</span>
        <span className="pl-1">{current.label}</span>
        <svg viewBox="0 0 10 6" className={`ml-2 h-1.5 w-2.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={label}
          onKeyDown={moveFocus}
          className="absolute top-[calc(100%+10px)] right-0 z-20 w-[250px] border border-[#eee] bg-white p-[5px]"
        >
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  setOpen(false)
                  buttonRef.current?.focus()
                  if (o.value !== value) onChange(o.value)
                }}
                className={`block w-full px-5 py-[9px] text-left text-sm leading-4 text-[#121212] underline-offset-2 outline-none hover:underline focus-visible:underline ${
                  o.value === value ? "underline" : ""
                }`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Two square icons, the current one in the brand colour; a thin rule separates them from the sort. */
function ViewSwitch({ view, onChange }: { view: ViewMode; onChange: (view: ViewMode) => void }) {
  const { t } = useI18n()
  const item = (mode: ViewMode, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      aria-pressed={view === mode}
      aria-label={label}
      title={label}
      onClick={() => view !== mode && onChange(mode)}
      className={cn("grid size-6 place-items-center", view === mode ? "text-brand" : "text-[#9a9a9a] hover:text-[#121212]")}
    >
      {icon}
    </button>
  )
  return (
    <div role="group" aria-label={t("collection.viewAs")} className="flex h-5 items-center gap-1.5 border-l border-[#dddddd] pl-[22px]">
      {item(
        "grid",
        t("catalog.gridView"),
        <svg viewBox="0 0 18 18" className="size-[18px]" fill="currentColor" aria-hidden="true">
          <rect x="1" y="1" width="7" height="7" />
          <rect x="10" y="1" width="7" height="7" />
          <rect x="1" y="10" width="7" height="7" />
          <rect x="10" y="10" width="7" height="7" />
        </svg>,
      )}
      {item(
        "list",
        t("catalog.listView"),
        <svg viewBox="0 0 18 18" className="size-[18px]" fill="currentColor" aria-hidden="true">
          <rect x="1" y="1.5" width="4" height="4" />
          <rect x="7" y="2.5" width="10" height="2" />
          <rect x="1" y="7" width="4" height="4" />
          <rect x="7" y="8" width="10" height="2" />
          <rect x="1" y="12.5" width="4" height="4" />
          <rect x="7" y="13.5" width="10" height="2" />
        </svg>,
      )}
    </div>
  )
}
