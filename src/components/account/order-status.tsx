import type { MessageKey } from "@/i18n/dictionary"
import type { OrderStage } from "@/lib/account/order-stage"

const STAGE_LABEL: Record<OrderStage, MessageKey> = {
  unpaid: "account.stageUnpaid",
  unshipped: "account.stageUnshipped",
  shipped: "account.stageShipped",
  delivered: "account.stageDelivered",
  completed: "account.stageCompleted",
  closed: "account.stageClosed",
}

/** Label key for a buyer-facing order stage (待付款 / 待发货 / 待收货 / 待评价 / 交易成功 / 交易关闭). */
export const orderStageKey = (stage: OrderStage): MessageKey => STAGE_LABEL[stage]

/** Same number the checkout success page shows (FR-00017). */
export const orderNumber = (displayId: number) => `FR-${String(displayId).padStart(5, "0")}`
