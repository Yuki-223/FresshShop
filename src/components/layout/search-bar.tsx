"use client"

import { Search } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useT } from "@/i18n/client"
import { useRouter } from "@/i18n/navigation"
import type { Category } from "@/types"

export function SearchBar({ categories }: { categories: Category[] }) {
  const t = useT()
  const router = useRouter()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get("q") ?? "")
  const [category, setCategory] = useState("all")
  const labels: Record<string, string> = {
    all: t("header.allCategories"),
    ...Object.fromEntries(categories.map((c) => [c.slug, c.name])),
  }

  return (
    <form
      role="search"
      className="flex h-11 w-[420px] items-center rounded-xl border border-line bg-surface"
      onSubmit={(e) => {
        e.preventDefault()
        const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""
        router.push(`/category/${category}${qs}`)
      }}
    >
      <Select value={category} onValueChange={(v) => v && setCategory(v)}>
        <SelectTrigger
          aria-label={t("header.category")}
          className="h-full shrink-0 border-0 bg-transparent pl-4 font-heading text-[15px] font-bold text-ink shadow-none focus-visible:ring-0 [&_svg]:text-brand"
        >
          <SelectValue>{(v: string) => labels[v]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("header.allCategories")}</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.slug} value={c.slug}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="h-5 w-px bg-line" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("header.searchPlaceholder")}
        aria-label={t("header.searchLabel")}
        className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm text-ink outline-none placeholder:text-ink-muted"
      />
      <button type="submit" aria-label={t("header.search")} className="grid size-10 place-items-center text-ink hover:text-brand">
        <Search className="size-4" />
      </button>
    </form>
  )
}
