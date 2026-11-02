"use client"

import { useState } from "react"
import { toast } from "sonner"
import { CartLineItem } from "@/components/cart/cart-line-item"
import { formatLongDate, formatPrice } from "@/lib/format"
import { TAX_RATE, type CartTotals } from "@/lib/store/cart"
import { useCart } from "@/lib/store/cart"

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

export function OrderSummary({ totals }: { totals: CartTotals }) {
  const items = useCart((s) => s.items)
  const promoCode = useCart((s) => s.promoCode)
  const applyPromo = useCart((s) => s.applyPromo)
  const [code, setCode] = useState("")

  return (
    <aside className="sticky top-6 rounded-xl border border-line p-6">
      <h2 className="text-[22px] font-semibold text-ink">Order Summary</h2>
      <p className="text-xs text-ink-muted">Price can change depending on shipping method and taxes of your state.</p>

      <div className="divide-y divide-surface-2 border-b border-surface-2">
        {items.map((item) => (
          <CartLineItem key={item.productId} item={item} />
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
        {totals.discount > 0 && <Row label={`Promo ${promoCode}`} value={`− ${formatPrice(totals.discount)}`} />}
        <Row label="Tax" value={`${Math.round(TAX_RATE * 100)}% ${formatPrice(totals.tax)}`} />
        <Row label="Shipping" value={formatPrice(totals.shipping)} />
      </div>

      <form
        className="mt-6 flex h-11 items-center rounded-xl border border-line bg-surface pr-4 pl-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (applyPromo(code)) {
            toast.success("Promo code applied")
            setCode("")
          } else toast.error("This promo code is not valid. Try FRESH10.")
        }}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={promoCode ? `Applied: ${promoCode}` : "Apply promo code"}
          aria-label="Promo code"
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-muted"
        />
        <button type="submit" className="font-heading text-sm font-bold text-ink hover:text-brand">
          Apply now
        </button>
      </form>

      <div className="mt-8 flex items-end justify-between">
        <div>
          <p className="font-heading text-xs font-semibold text-ink">Total Order</p>
          <p className="text-xs text-brand">Guaranteed delivery day: {formatLongDate(guaranteedDeliveryDate())}</p>
        </div>
        <p className="font-heading text-2xl font-semibold text-brand">{formatPrice(totals.total)}</p>
      </div>
    </aside>
  )
}
