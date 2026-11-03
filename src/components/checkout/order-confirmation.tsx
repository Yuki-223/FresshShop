"use client"

import { CircleCheck } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useSyncExternalStore } from "react"
import { ButtonLink } from "@/components/common/button-link"
import { LAST_ORDER_KEY, type StoredOrder } from "@/components/checkout/checkout-form"
import { useI18n } from "@/i18n/client"

function readOrder(): string | null {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY)
  } catch {
    return null
  }
}

export function OrderConfirmation() {
  const { t, fmt } = useI18n()
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
      <h1 className="mt-6 text-[32px] font-semibold text-ink">{t("success.title")}</h1>
      {orderId && (
        <p className="mt-2 text-sm text-ink-muted">
          {t("success.orderNumber")} <span className="font-heading font-semibold text-ink">{orderId}</span>
        </p>
      )}
      {match && (
        <dl className="mt-10 grid w-full grid-cols-2 gap-y-3 rounded-xl border border-line p-6 text-left text-sm">
          <dt className="text-ink-muted">{t("success.name")}</dt>
          <dd className="text-right text-ink">{match.name}</dd>
          <dt className="text-ink-muted">{t("success.sentTo")}</dt>
          <dd className="text-right text-ink">{match.email}</dd>
          <dt className="text-ink-muted">{t("success.items")}</dt>
          <dd className="text-right text-ink">{match.items}</dd>
          <dt className="text-ink-muted">{t("success.delivery")}</dt>
          <dd className="text-right text-ink">
            {match.carrier} · {fmt.longDate(match.deliveryDate)}
          </dd>
          <dt className="font-heading font-semibold text-ink">{t("success.totalPaid")}</dt>
          <dd className="text-right font-heading text-lg font-semibold text-brand">{match.total}</dd>
        </dl>
      )}
      <ButtonLink href="/" className="mt-10">
        {t("success.continue")}
      </ButtonLink>
    </div>
  )
}
