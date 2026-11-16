/**
 * Buyer-facing order stage, Taobao style. Medusa keeps three separate fields on an order
 * (status, payment_status, fulfillment_status); this folds them into the one word a customer
 * expects to see: 待付款 → 待发货 → 待收货 → 待评价 → 交易成功, or 交易关闭.
 */
export const ORDER_STAGES = ["unpaid", "unshipped", "shipped", "delivered", "completed", "closed"] as const
export type OrderStage = (typeof ORDER_STAGES)[number]

export interface OrderStatusFields {
  status: string
  paymentStatus: string
  fulfillmentStatus: string
}

const PAID = new Set(["authorized", "partially_authorized", "captured", "partially_captured", "partially_refunded"])

export function orderStage({ status, paymentStatus, fulfillmentStatus }: OrderStatusFields): OrderStage {
  if (status === "canceled" || status === "archived") return "closed"
  if (paymentStatus === "refunded" || paymentStatus === "canceled") return "closed"
  if (status === "completed") return "completed"
  if (!PAID.has(paymentStatus)) return "unpaid"
  if (fulfillmentStatus === "delivered" || fulfillmentStatus === "partially_delivered") return "delivered"
  if (fulfillmentStatus === "shipped" || fulfillmentStatus === "partially_shipped") return "shipped"
  return "unshipped"
}
