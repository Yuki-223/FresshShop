"use client"

import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"
import { useHydrated } from "@/hooks/use-hydrated"
import { useI18n } from "@/i18n/client"
import { Link, useRouter } from "@/i18n/navigation"
import { clearHistory, removeFromHistory } from "@/lib/history/actions"
import type { HistoryEntry } from "@/lib/history/types"

type Group = "today" | "yesterday" | "earlier"
const GROUP_LABEL = { today: "history.today", yesterday: "history.yesterday", earlier: "history.earlier" } as const

/** Today / yesterday / earlier, in the visitor's own time zone (so only after hydration). */
function groupOf(iso: string, now: Date): Group {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const t = new Date(iso).getTime()
  if (t >= startOfToday) return "today"
  if (t >= startOfToday - 24 * 60 * 60 * 1000) return "yesterday"
  return "earlier"
}

/** The account's browsing history: grouped by day, each product removable, and "Clear all". */
export function HistoryList({ entries }: { entries: HistoryEntry[] }) {
  const { t, fmt, locale } = useI18n()
  const router = useRouter()
  const hydrated = useHydrated()
  const [busy, setBusy] = useState(false)

  const run = async (job: () => Promise<void>, done: string) => {
    setBusy(true)
    try {
      await job()
      toast(done)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setBusy(false)
    }
  }

  if (!hydrated) return <div className="mt-6 h-40" aria-busy="true" />

  const now = new Date()
  const time = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", { hour: "numeric", minute: "2-digit" })
  const groups = (["today", "yesterday", "earlier"] as const)
    .map((g) => ({ g, items: entries.filter((e) => groupOf(e.viewedAt, now) === g) }))
    .filter((x) => x.items.length > 0)

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#121212]/60">{t.plural("history.note", entries.length)}</p>
        <button
          type="button"
          disabled={busy}
          className="text-sm text-[#276cbc] hover:underline disabled:opacity-50"
          onClick={() => window.confirm(t("history.clearConfirm")) && run(clearHistory, t("history.cleared"))}
        >
          {t("history.clearAll")}
        </button>
      </div>

      {groups.map(({ g, items }) => (
        <section key={g} className="mt-6">
          <h3 className="text-[15px] font-bold text-[#121212]">{t(GROUP_LABEL[g])}</h3>
          <ul className="mt-2 border-t border-[#e5e5e5]">
            {items.map(({ product, viewedAt }) => (
              <li key={product.medusaId} className="flex items-center gap-5 border-b border-[#e5e5e5] py-4">
                <Link href={`/product/${product.slug}`} className="relative size-16 shrink-0 border border-[#121212]/[0.06] bg-white" tabIndex={-1} aria-hidden="true">
                  {product.image && <Image src={product.image} alt="" fill sizes="64px" unoptimized={/^https?:/.test(product.image)} className="object-contain p-1" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/product/${product.slug}`} className="text-[15px] text-[#121212] hover:underline">
                    {product.title}
                  </Link>
                  <p className="mt-1 text-[13px] text-[#121212]/60">
                    {product.productLine ? `${product.productLine} · ` : ""}
                    {g === "earlier" ? fmt.longDate(viewedAt) : time.format(new Date(viewedAt))}
                  </p>
                </div>
                <p className="w-28 text-right text-base font-bold text-[#121212]">{fmt.price(product.price)}</p>
                <button
                  type="button"
                  disabled={busy}
                  className="w-16 text-right text-sm text-[#276cbc] hover:underline disabled:opacity-50"
                  onClick={() => run(() => removeFromHistory(product.medusaId!), t("history.removed"))}
                >
                  {t("history.remove")}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
