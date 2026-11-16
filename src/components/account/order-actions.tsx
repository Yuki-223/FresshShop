"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { useI18n } from "@/i18n/client"
import { Link, useRouter } from "@/i18n/navigation"
import { cancelOrder, confirmDelivery, reorder } from "@/lib/account/actions"
import type { OrderSummary } from "@/lib/account/types"
import { TrackingSheet } from "@/components/account/tracking-sheet"
import { useCart } from "@/lib/store/cart"
import { cn } from "@/lib/utils"

const base = "inline-flex h-8 items-center justify-center rounded-sm border px-3 text-[13px] whitespace-nowrap transition-colors disabled:opacity-50"
const primary = cn(base, "border-brand text-brand hover:bg-brand hover:text-white")
const secondary = cn(base, "border-[#d9d9d9] text-[#121212]/75 hover:border-[#121212] hover:text-[#121212]")

/**
 * Taobao-style "交易操作" buttons; which ones show depends on the order's stage.
 * 待付款 / 待发货 → 取消订单 · 待收货 → 确认收货 + 查看物流 · 待评价 → 去评价 + 再次购买 · 交易成功 / 关闭 → 再次购买
 * `tracking: false` hides 查看物流 (the detail page shows the timeline inline instead).
 */
export function OrderActions({ order, className, tracking = true }: { order: OrderSummary; className?: string; tracking?: boolean }) {
  const { t } = useI18n()
  const router = useRouter()
  const [pending, start] = useTransition()
  const refreshCart = useCart((s) => s.refresh)
  const openCart = useCart((s) => s.setOpen)

  const run = (confirm: string | null, action: () => Promise<{ ok: boolean; error?: string }>, done: string) => {
    if (confirm && !window.confirm(confirm)) return
    start(async () => {
      const r = await action()
      if (!r.ok) return void toast.error(r.error ?? t("account.actionFailed"))
      toast.success(done)
      router.refresh()
    })
  }
  const buyAgain = () =>
    start(async () => {
      const r = await reorder(order.id)
      if (!r.ok) return void toast.error(r.error === "none" ? t("account.reorderFailed") : r.error)
      await refreshCart()
      toast.success(t.plural("account.reordered", r.added ?? 0))
      openCart(true)
    })

  const buttons: React.ReactNode[] = []
  if (order.stage === "unpaid" || order.stage === "unshipped")
    buttons.push(
      <button key="cancel" type="button" disabled={pending} className={secondary} onClick={() => run(t("account.cancelConfirm"), () => cancelOrder(order.id), t("account.orderCanceled"))}>
        {t("account.cancelOrder")}
      </button>,
    )
  if (order.stage === "shipped")
    buttons.push(
      <button key="confirm" type="button" disabled={pending} className={primary} onClick={() => run(t("account.confirmDeliveryConfirm"), () => confirmDelivery(order.id), t("account.deliveryConfirmed"))}>
        {t("account.confirmDelivery")}
      </button>,
    )
  if (tracking && (order.stage === "shipped" || order.stage === "delivered" || (order.stage === "completed" && order.fulfillmentStatus !== "not_fulfilled")))
    buttons.push(<TrackingSheet key="tracking" order={order} className={secondary} />)
  if (order.stage === "delivered" && order.firstHandle)
    buttons.push(
      <Link key="review" href={`/product/${order.firstHandle}#reviews`} className={primary}>
        {t("account.writeReview")}
      </Link>,
    )
  if (order.stage === "delivered" || order.stage === "completed" || order.stage === "closed")
    buttons.push(
      <button key="again" type="button" disabled={pending} className={secondary} onClick={buyAgain}>
        {t("account.buyAgain")}
      </button>,
    )
  if (buttons.length === 0) return null
  return <div className={cn("flex flex-col items-stretch gap-2", className)}>{buttons}</div>
}
