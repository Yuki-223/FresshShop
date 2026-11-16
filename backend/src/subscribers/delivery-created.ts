import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { markDelivered } from "../lib/shipments"

/** A fulfillment was marked delivered (admin, or the customer's 确认收货): close the tracking with 已签收. */
export default async function deliveryCreated({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  await markDelivered(container, data.id)
}

export const config: SubscriberConfig = { event: "delivery.created" }
