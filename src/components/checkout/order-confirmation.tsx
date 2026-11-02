"use client"

import { CircleCheck } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useSyncExternalStore } from "react"
import { ButtonLink } from "@/components/common/button-link"
import { LAST_ORDER_KEY } from "@/components/checkout/checkout-form"
import { formatLongDate, formatPrice } from "@/lib/format"

interface StoredOrder {
  id: string
  email: string
  name: string
  total: number
  items: number
  shippingMethod: string
  deliveryDate: string
}

function readOrder(): string | null {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY)
  } catch {
    return null
  }
}

export function OrderConfirmation() {
  const orderId = useSearchParams().get("order")
  const raw = useSyncExternalStore(
    () => () => {},
    readOrder,
    () => null,
  )
  const order: StoredOrder | null = raw ? JSON.parse(raw) : null
  const match = order && order.id === orderId ? order : null

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
      <CircleCheck className="size-16 text-brand" strokeWidth={1.5} />
      <h1 className="mt-6 text-[32px] font-semibold text-ink">Thank you for your order!</h1>
      {orderId && (
        <p className="mt-2 text-sm text-ink-muted">
          Order number <span className="font-heading font-semibold text-ink">{orderId}</span>
        </p>
      )}
      {match && (
        <dl className="mt-10 grid w-full grid-cols-2 gap-y-3 rounded-xl border border-line p-6 text-left text-sm">
          <dt className="text-ink-muted">Name</dt>
          <dd className="text-right text-ink">{match.name}</dd>
          <dt className="text-ink-muted">Confirmation sent to</dt>
          <dd className="text-right text-ink">{match.email}</dd>
          <dt className="text-ink-muted">Items</dt>
          <dd className="text-right text-ink">{match.items}</dd>
          <dt className="text-ink-muted">Delivery</dt>
          <dd className="text-right text-ink">
            {match.shippingMethod.toUpperCase()} · {formatLongDate(match.deliveryDate)}
          </dd>
          <dt className="font-heading font-semibold text-ink">Total paid</dt>
          <dd className="text-right font-heading text-lg font-semibold text-brand">{formatPrice(match.total)}</dd>
        </dl>
      )}
      <ButtonLink href="/" className="mt-10">
        Continue shopping
      </ButtonLink>
    </div>
  )
}
