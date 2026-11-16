import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ensureShipment } from "../lib/shipments"

/** A fulfillment was marked shipped (admin "Mark as shipped"): create its parcel + demo route. */
export default async function shipmentCreated({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  await ensureShipment(container, data.id)
}

export const config: SubscriberConfig = { event: "shipment.created" }
