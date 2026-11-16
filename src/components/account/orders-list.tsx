"use client"

import Image from "next/image"
import { useMemo } from "react"
import { OrderStageBadge } from "@/components/account/order-stage-badge"
import { orderNumber, orderStageKey } from "@/components/account/order-status"
import { ButtonLink } from "@/components/common/button-link"
import { useQueryState } from "@/hooks/use-query-state"
import { useI18n } from "@/i18n/client"
import { Link } from "@/i18n/navigation"
import type { OrderStage } from "@/lib/account/order-stage"
import type { OrderSummary } from "@/lib/account/types"
import { cn } from "@/lib/utils"

/** Taobao-style tabs: everything, then the four "waiting on something" stages. */
const TABS = ["all", "unpaid", "unshipped", "shipped", "delivered"] as const
type Tab = (typeof TABS)[number]
const isTab = (v: string | null): v is Tab => (TABS as readonly string[]).includes(v ?? "")

/** Order list with stage tabs; the chosen tab lives in the URL (?stage=…). Must render inside <Suspense>. */
export function OrdersList({ orders }: { orders: OrderSummary[] }) {
  const { t, fmt } = useI18n()
  const { params, set } = useQueryState()
  const raw = params.get("stage")
  const tab: Tab = isTab(raw) ? raw : "all"

  const counts = useMemo(() => {
    const n: Record<OrderStage, number> = { unpaid: 0, unshipped: 0, shipped: 0, delivered: 0, completed: 0, closed: 0 }
    for (const o of orders) n[o.stage]++
    return n
  }, [orders])
  const visible = tab === "all" ? orders : orders.filter((o) => o.stage === tab)

  return (
    <div>
      <div role="tablist" aria-label={t("account.orderTabs")} className="mt-4 flex gap-8 border-b border-[#e5e5e5]">
        {TABS.map((key) => {
          const active = key === tab
          const count = key === "all" ? orders.length : counts[key]
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => set({ stage: key === "all" ? null : key })}
              className={cn(
                "-mb-px flex items-center gap-1.5 border-b-2 pb-3 text-[15px] tracking-[0.3px] transition-colors",
                active ? "border-brand font-bold text-[#121212]" : "border-transparent text-[#121212]/65 hover:text-[#121212]",
              )}
            >
              {key === "all" ? t("account.tabAll") : t(orderStageKey(key))}
              {count > 0 && key !== "all" && (
                <span className={cn("rounded-full px-1.5 text-[11px] leading-4 font-bold", active ? "bg-brand text-white" : "bg-[#f0f0f0] text-[#121212]/65")}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 border border-dashed border-[#d9d9d9] px-6 py-16 text-center">
          <p className="text-[15px] text-[#121212]/75">{tab === "all" ? t("account.noOrders") : t("account.noOrdersInTab", { stage: t(orderStageKey(tab)) })}</p>
          <ButtonLink href="/category/all" className="mt-5">
            {t("account.startShopping")}
          </ButtonLink>
        </div>
      ) : (
        <ul>
          {visible.map((o) => (
            <li key={o.id} className="flex items-center gap-6 border-b border-[#e5e5e5] py-5">
              <div className="w-[230px] shrink-0">
                <Link href={`/account/orders/${o.id}`} className="text-[15px] font-bold text-[#121212] hover:underline">
                  {t("account.orderNumber", { number: orderNumber(o.displayId) })}
                </Link>
                <p className="mt-1 text-[13px] text-[#121212]/60">{t("account.placedOn", { date: fmt.date(o.createdAt) })}</p>
                <p className="mt-1 text-[13px] text-[#121212]/60">{t.plural("account.items", o.itemCount)}</p>
              </div>
              <div className="flex flex-1 gap-2">
                {o.thumbnails.slice(0, 5).map((src, i) => (
                  <div key={`${src}-${i}`} className="relative size-14 border border-[#121212]/[0.06] bg-white">
                    <Image src={src} alt="" fill sizes="56px" unoptimized={/^https?:/.test(src)} className="object-contain p-1" />
                  </div>
                ))}
                {o.thumbnails.length > 5 && <span className="self-center text-sm text-[#121212]/60">+{o.thumbnails.length - 5}</span>}
              </div>
              <p className="w-28 text-right text-base font-bold text-[#121212]">{fmt.price(o.total)}</p>
              <div className="flex w-28 justify-end">
                <OrderStageBadge stage={o.stage} />
              </div>
              <Link href={`/account/orders/${o.id}`} className="w-28 text-right text-sm text-[#276cbc] hover:underline">
                {t("account.viewOrder")} ›
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
