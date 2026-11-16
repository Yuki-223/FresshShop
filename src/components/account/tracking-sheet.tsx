"use client"

import { useState } from "react"
import { ShipmentsPanel } from "@/components/account/tracking-timeline"
import { orderNumber } from "@/components/account/order-status"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useI18n } from "@/i18n/client"
import { getShipments } from "@/lib/account/actions"
import type { OrderSummary, Shipment } from "@/lib/account/types"

/** 查看物流 button: opens a side panel and loads the order's parcels on first open. */
export function TrackingSheet({ order, className }: { order: OrderSummary; className?: string }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [shipments, setShipments] = useState<Shipment[] | null>(null)
  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          setOpen(true)
          if (shipments === null) getShipments(order.id).then(setShipments)
        }}
      >
        {t("tracking.view")}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-[420px] gap-0 overflow-y-auto p-0 data-[side=right]:sm:max-w-[420px]">
          <SheetHeader className="px-6 pt-8 pb-4">
            <SheetTitle className="text-xl font-bold text-[#121212]">{t("tracking.title")}</SheetTitle>
            <SheetDescription className="text-[13px] text-[#121212]/60">{t("account.orderNumber", { number: orderNumber(order.displayId) })}</SheetDescription>
          </SheetHeader>
          <div className="px-6 pb-8">{shipments === null ? <p className="text-[14px] text-[#121212]/60">{t("common.loading")}…</p> : <ShipmentsPanel shipments={shipments} />}</div>
        </SheetContent>
      </Sheet>
    </>
  )
}
