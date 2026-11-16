import { model } from "@medusajs/framework/utils"
import TrackingEvent from "./tracking-event"

/**
 * One parcel = one Medusa fulfillment that has been shipped. Holds the carrier and tracking
 * number plus the tracking events (TrackingEvent). Created automatically when a fulfillment is
 * marked shipped (src/subscribers/shipment-created.ts); the demo route is generated then.
 */
const Shipment = model
  .define("shipment", {
    id: model.id({ prefix: "ship" }).primaryKey(),
    order_id: model.text(),
    fulfillment_id: model.text().unique(),
    /** fedex / dhl / sf / jd / other */
    carrier_code: model.text(),
    carrier_name: model.text(),
    tracking_number: model.text(),
    origin: model.text(),
    destination: model.text(),
    shipped_at: model.dateTime(),
    delivered_at: model.dateTime().nullable(),
    events: model.hasMany(() => TrackingEvent, { mappedBy: "shipment" }),
  })
  .indexes([{ on: ["order_id"] }])

export default Shipment
