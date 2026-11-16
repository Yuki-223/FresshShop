import { model } from "@medusajs/framework/utils"
import Shipment from "./shipment"

/** Tracking event codes; the storefront translates them. `note` is free text (manual entries). */
export const TRACKING_CODES = ["picked_up", "departed", "arrived", "in_transit", "out_for_delivery", "delivered", "exception", "note"] as const
export type TrackingCode = (typeof TRACKING_CODES)[number]

/**
 * One line of a parcel's tracking history. Events may be dated in the future: the demo route
 * is written in one go when the parcel ships, and the store API only shows events whose
 * `occurred_at` has passed, so the parcel appears to move over the following two days.
 */
const TrackingEvent = model
  .define("tracking_event", {
    id: model.id({ prefix: "trk" }).primaryKey(),
    shipment: model.belongsTo(() => Shipment, { mappedBy: "events" }),
    code: model.enum([...TRACKING_CODES]),
    location: model.text().nullable(),
    note: model.text().nullable(),
    occurred_at: model.dateTime(),
  })
  .indexes([{ on: ["shipment_id", "occurred_at"] }])

export default TrackingEvent
