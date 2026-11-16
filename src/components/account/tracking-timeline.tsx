"use client"

import { Check, Package, Truck } from "lucide-react"
import { useI18n } from "@/i18n/client"
import type { Shipment, TrackingEvent } from "@/lib/account/types"
import { cn } from "@/lib/utils"

const STATUS_STYLE: Record<Shipment["status"], string> = {
  shipped: "bg-[#e8f1fb] text-[#276cbc]",
  in_transit: "bg-[#e6f6f4] text-[#0f766e]",
  out_for_delivery: "bg-[#fff4e5] text-[#b85c00]",
  delivered: "bg-[#e9f5e9] text-[#2e7d32]",
  exception: "bg-[#fdecea] text-[#b3261e]",
}

function eventText(e: TrackingEvent, t: ReturnType<typeof useI18n>["t"]) {
  if (e.code === "note") return e.note ?? ""
  const where = e.location ?? ""
  switch (e.code) {
    case "picked_up":
      return t("tracking.evPickedUp", { location: where })
    case "departed":
      return t("tracking.evDeparted", { location: where })
    case "arrived":
      return t("tracking.evArrived", { location: where })
    case "in_transit":
      return t("tracking.evInTransit")
    case "out_for_delivery":
      return t("tracking.evOutForDelivery", { location: where })
    case "delivered":
      return t("tracking.evDelivered", { location: where })
    case "exception":
      return e.note ? `${t("tracking.evException")}: ${e.note}` : t("tracking.evException")
  }
}

/** One parcel: carrier, tracking number and the Taobao-style vertical timeline (newest on top). */
export function TrackingTimeline({ shipment, className }: { shipment: Shipment; className?: string }) {
  const { t, fmt } = useI18n()
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        {shipment.status === "delivered" ? <Check className="size-5 text-[#2e7d32]" /> : <Truck className="size-5 text-[#121212]/70" strokeWidth={1.75} />}
        <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-bold", STATUS_STYLE[shipment.status])}>{t(`tracking.status_${shipment.status}`)}</span>
      </div>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
        <dt className="text-[#121212]/60">{t("tracking.carrier")}</dt>
        <dd className="text-[#121212]">{shipment.carrierName}</dd>
        <dt className="text-[#121212]/60">{t("tracking.number")}</dt>
        <dd className="font-mono text-[#121212]">{shipment.trackingNumber}</dd>
        <dt className="text-[#121212]/60">{t("tracking.route")}</dt>
        <dd className="text-[#121212]">
          {shipment.origin} → {shipment.destination}
        </dd>
      </dl>
      <ol className="mt-5 border-l-2 border-[#e5e5e5] pl-5">
        {shipment.events.map((e, i) => (
          <li key={e.id} className="relative pb-5 last:pb-0">
            <span
              className={cn(
                "absolute top-1.5 -left-[25px] size-3 rounded-full border-2 border-white",
                i === 0 ? (shipment.status === "delivered" ? "bg-[#2e7d32]" : "bg-brand") : "bg-[#c9c9c9]",
              )}
            />
            <p className={cn("text-[14px] leading-snug", i === 0 ? "font-bold text-[#121212]" : "text-[#121212]/75")}>{eventText(e, t)}</p>
            <p className="mt-0.5 text-[12px] text-[#121212]/50">{fmt.dateTime(e.occurredAt)}</p>
          </li>
        ))}
        {shipment.events.length === 0 && (
          <li className="flex items-center gap-2 text-[14px] text-[#121212]/60">
            <Package className="size-4" /> {t("tracking.noEvents")}
          </li>
        )}
      </ol>
    </div>
  )
}

/** All parcels of an order, each with its timeline; a heading between them when there are several. */
export function ShipmentsPanel({ shipments }: { shipments: Shipment[] }) {
  const { t } = useI18n()
  if (shipments.length === 0) return <p className="text-[14px] text-[#121212]/60">{t("tracking.none")}</p>
  return (
    <div className="space-y-8">
      {shipments.map((s, i) => (
        <div key={s.id}>
          {shipments.length > 1 && <p className="mb-2 text-[13px] font-bold text-[#121212]">{t("tracking.parcel", { n: i + 1, total: shipments.length })}</p>}
          <TrackingTimeline shipment={s} />
        </div>
      ))}
    </div>
  )
}
