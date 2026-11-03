"use client"

import { useState } from "react"
import { toast } from "sonner"
import { CartLineItem } from "@/components/cart/cart-line-item"
import { useI18n } from "@/i18n/client"
import { type CartTotals, useCart } from "@/lib/store/cart"

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between font-heading text-xs font-semibold text-ink">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}

export function guaranteedDeliveryDate(days = 3) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString()
}

/** All amounts in `totals` are already in the display currency. */
export function OrderSummary({ totals, deliveryDays }: { totals: CartTotals; deliveryDays?: number }) {
  const { t, fmt } = useI18n()
  const items = useCart((s) => s.items)
  const promoCode = useCart((s) => s.promoCode)
  const applyPromo = useCart((s) => s.applyPromo)
  const [code, setCode] = useState("")

  return (
    <aside className="sticky top-6 rounded-xl border border-line p-6">
      <h2 className="text-[22px] font-semibold text-ink">{t("checkout.orderSummary")}</h2>
      <p className="text-xs text-ink-muted">{t("checkout.orderSummarySub")}</p>
      {items.some((i) => i.purchase.type === "subscription") && (
        <p className="mt-3 rounded-xl bg-brand-soft px-3 py-2 text-xs text-brand-dark">{t("checkout.subscriptionNote")}</p>
      )}

      <div className="divide-y divide-surface-2 border-b border-surface-2">
        {items.map((item) => (
          <CartLineItem key={item.productId} item={item} />
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <Row label={t("checkout.subtotal")} value={fmt.amount(totals.subtotal)} />
        {totals.discount > 0 && <Row label={t("checkout.promo", { code: promoCode ?? "" })} value={`− ${fmt.amount(totals.discount)}`} />}
        <Row label={`${t("checkout.tax")} (${Math.round(totals.taxRate * 100)}%)`} value={fmt.amount(totals.tax)} />
        <Row label={t("checkout.shipping")} value={fmt.amount(totals.shipping)} />
      </div>

      <form
        className="mt-6 flex h-11 items-center rounded-xl border border-line bg-surface pr-4 pl-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (applyPromo(code)) {
            toast.success(t("checkout.promoSuccess"))
            setCode("")
          } else toast.error(t("checkout.promoInvalid"))
        }}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={promoCode ? t("checkout.promoApplied", { code: promoCode }) : t("checkout.promoPlaceholder")}
          aria-label={t("checkout.promoLabel")}
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-muted"
        />
        <button type="submit" className="font-heading text-sm font-bold text-ink hover:text-brand">
          {t("checkout.applyNow")}
        </button>
      </form>

      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-heading text-xs font-semibold text-ink">{t("checkout.totalOrder")}</p>
          <p className="text-xs text-brand">{t("checkout.guaranteedDelivery", { date: fmt.longDate(guaranteedDeliveryDate(deliveryDays)) })}</p>
        </div>
        <p className="font-heading text-2xl font-semibold whitespace-nowrap text-brand">{fmt.amount(totals.total)}</p>
      </div>
    </aside>
  )
}
