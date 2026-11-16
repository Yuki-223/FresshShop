"use client"

import { orderStageKey } from "@/components/account/order-status"
import { useI18n } from "@/i18n/client"
import type { OrderStage } from "@/lib/account/order-stage"
import { cn } from "@/lib/utils"

const STAGE_STYLE: Record<OrderStage, string> = {
  unpaid: "bg-[#fff4e5] text-[#b85c00]",
  unshipped: "bg-[#e8f1fb] text-[#276cbc]",
  shipped: "bg-[#e6f6f4] text-[#0f766e]",
  delivered: "bg-[#f1ecfb] text-[#6d3fc4]",
  completed: "bg-[#e9f5e9] text-[#2e7d32]",
  closed: "bg-[#f0f0f0] text-[#121212]/55",
}

/** Small colored pill with the order's buyer-facing stage. */
export function OrderStageBadge({ stage, className }: { stage: OrderStage; className?: string }) {
  const { t } = useI18n()
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-bold tracking-[0.2px] whitespace-nowrap", STAGE_STYLE[stage], className)}>
      {t(orderStageKey(stage))}
    </span>
  )
}
