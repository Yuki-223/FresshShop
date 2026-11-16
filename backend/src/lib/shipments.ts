/**
 * Parcel tracking for the storefront. There is no real carrier API in this demo, so when a
 * fulfillment is marked shipped we write a plausible route for the carrier in one go, with
 * timestamps spread over the next two days; readers only see events that have already
 * "happened". Marking the parcel delivered appends 已签收 and drops any events still in the future.
 * Plugging in a real carrier later means replacing `demoRoute` and keeping everything else.
 */
import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { SHIPMENT_TRACKING_MODULE } from "../modules/shipment-tracking"
import type { TrackingCode } from "../modules/shipment-tracking/models/tracking-event"
import type ShipmentTrackingModuleService from "../modules/shipment-tracking/service"

export type CarrierCode = "fedex" | "dhl" | "sf" | "jd" | "other"

export interface ShipmentView {
  id: string
  fulfillment_id: string
  carrier_code: CarrierCode
  carrier_name: string
  tracking_number: string
  origin: string
  destination: string
  shipped_at: Date
  delivered_at: Date | null
  /** latest visible event's code, or "shipped" before the first one */
  status: "shipped" | "in_transit" | "out_for_delivery" | "delivered" | "exception"
  events: { id: string; code: TrackingCode; location: string | null; note: string | null; occurred_at: Date }[]
}

const service = (container: MedusaContainer) => container.resolve<ShipmentTrackingModuleService>(SHIPMENT_TRACKING_MODULE)

export function carrierCode(name: string): CarrierCode {
  const n = name.toLowerCase()
  if (n.includes("fedex")) return "fedex"
  if (n.includes("dhl")) return "dhl"
  if (n.includes("sf") || name.includes("顺丰")) return "sf"
  if (n.includes("jd") || name.includes("京东")) return "jd"
  return "other"
}

/** Deterministic, carrier-shaped tracking number from the fulfillment id. */
export function trackingNumber(carrier: CarrierCode, seed: string) {
  let h = 0x811c9dc5
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193) >>> 0
  const digits = (n: number) => String(h).padStart(n, "7").slice(-n) + String(Math.imul(h, 2654435761) >>> 0).padStart(10, "3")
  switch (carrier) {
    case "fedex":
      return digits(12).slice(0, 12)
    case "dhl":
      return digits(10).slice(0, 10)
    case "sf":
      return "SF" + digits(13).slice(0, 13)
    case "jd":
      return "JD" + digits(13).slice(0, 13)
    default:
      return "TRK" + digits(10).slice(0, 10)
  }
}

type RouteStop = { code: TrackingCode; location: string | null; hours: number }

/** Where the parcel starts and passes through. Hours are offsets from shipped_at. */
export function demoRoute(carrier: CarrierCode, country: string, destination: string): { origin: string; stops: RouteStop[] } {
  const cn = country === "cn"
  const origin = cn ? "上海市 青浦区 仓库" : "Gig Harbor, WA"
  const hub = cn ? (carrier === "jd" ? "华东转运中心（昆山）" : "上海转运中心") : carrier === "dhl" ? "Cincinnati, OH" : "Memphis, TN"
  const local = cn ? `${destination} 派送点` : `${destination} facility`
  return {
    origin,
    stops: [
      { code: "picked_up", location: origin, hours: 0 },
      { code: "departed", location: origin, hours: 3 },
      { code: "arrived", location: hub, hours: cn ? 10 : 16 },
      { code: "departed", location: hub, hours: cn ? 13 : 20 },
      { code: "in_transit", location: null, hours: cn ? 20 : 30 },
      { code: "arrived", location: local, hours: cn ? 30 : 42 },
      { code: "out_for_delivery", location: local, hours: cn ? 33 : 46 },
    ],
  }
}

type FulfillmentRow = {
  id: string
  shipped_at: Date | null
  delivered_at: Date | null
  canceled_at: Date | null
  delivery_address?: { city?: string | null; province?: string | null; country_code?: string | null } | null
  order?: { id: string; shipping_methods?: { name: string }[] | null } | null
}

async function loadFulfillment(container: MedusaContainer, fulfillmentId: string): Promise<FulfillmentRow> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [f],
  } = await query.graph({
    entity: "fulfillment",
    fields: ["id", "shipped_at", "delivered_at", "canceled_at", "delivery_address.city", "delivery_address.province", "delivery_address.country_code", "order.id", "order.shipping_methods.name"],
    filters: { id: fulfillmentId },
  })
  if (!f) throw new MedusaError(MedusaError.Types.NOT_FOUND, `Fulfillment ${fulfillmentId} not found`)
  return f as unknown as FulfillmentRow
}

/**
 * The shipment record for a shipped fulfillment, created with its demo route if it doesn't exist
 * yet (so parcels shipped before this module existed get one on first read). Null when the
 * fulfillment hasn't shipped or was canceled.
 */
export async function ensureShipment(container: MedusaContainer, fulfillmentId: string) {
  const svc = service(container)
  const [existing] = await svc.listShipments({ fulfillment_id: fulfillmentId }, { take: 1 })
  if (existing) return existing
  const f = await loadFulfillment(container, fulfillmentId)
  if (!f.shipped_at || f.canceled_at || !f.order) return null

  const carrierName = f.order.shipping_methods?.[0]?.name ?? "Carrier"
  const carrier = carrierCode(carrierName)
  const a = f.delivery_address ?? {}
  const country = (a.country_code ?? "us").toLowerCase()
  const destination = country === "cn" ? [a.province, a.city].filter(Boolean).join(" ") || "收货地" : [a.city, a.province].filter(Boolean).join(", ") || "Destination"
  const route = demoRoute(carrier, country, destination)
  const shippedAt = new Date(f.shipped_at)

  const shipment = await svc.createShipments({
    order_id: f.order.id,
    fulfillment_id: f.id,
    carrier_code: carrier,
    carrier_name: carrierName,
    tracking_number: trackingNumber(carrier, f.id),
    origin: route.origin,
    destination,
    shipped_at: shippedAt,
    delivered_at: null,
  })
  await svc.createTrackingEvents(
    route.stops.map((s) => ({ shipment_id: shipment.id, code: s.code, location: s.location, note: null, occurred_at: new Date(shippedAt.getTime() + s.hours * 3600_000) })),
  )
  if (f.delivered_at) await markDelivered(container, f.id, new Date(f.delivered_at))
  return shipment
}

/** 已签收: append the delivered event and drop route stops that would come after it. */
export async function markDelivered(container: MedusaContainer, fulfillmentId: string, at = new Date()) {
  const svc = service(container)
  const shipment = await ensureShipment(container, fulfillmentId)
  if (!shipment || shipment.delivered_at) return
  const future = await svc.listTrackingEvents({ shipment_id: shipment.id, occurred_at: { $gt: at } }, { select: ["id"] })
  if (future.length) await svc.deleteTrackingEvents(future.map((e) => e.id))
  await svc.createTrackingEvents({ shipment_id: shipment.id, code: "delivered", location: shipment.destination, note: null, occurred_at: at })
  await svc.updateShipments({ id: shipment.id, delivered_at: at })
}

/** Adds a manual event (admin). */
export async function addEvent(container: MedusaContainer, shipmentId: string, input: { code: TrackingCode; location?: string | null; note?: string | null; occurred_at?: Date }) {
  const svc = service(container)
  const [shipment] = await svc.listShipments({ id: shipmentId }, { take: 1 })
  if (!shipment) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Shipment not found")
  const at = input.occurred_at ?? new Date()
  const event = await svc.createTrackingEvents({ shipment_id: shipment.id, code: input.code, location: input.location ?? null, note: input.note ?? null, occurred_at: at })
  if (input.code === "delivered" && !shipment.delivered_at) await svc.updateShipments({ id: shipment.id, delivered_at: at })
  return event
}

/**
 * All parcels of an order with their tracking history, newest event first. Parcels shipped
 * before this module existed are backfilled here. `includeFuture` (admin) shows the whole
 * planned route; customers only see what has happened.
 */
export async function listOrderShipments(container: MedusaContainer, orderId: string, opts: { includeFuture?: boolean } = {}): Promise<ShipmentView[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const {
    data: [order],
  } = await query.graph({ entity: "order", fields: ["id", "fulfillments.id", "fulfillments.shipped_at", "fulfillments.canceled_at"], filters: { id: orderId } })
  for (const f of order?.fulfillments ?? []) if (f?.shipped_at && !f.canceled_at) await ensureShipment(container, f.id)

  const svc = service(container)
  const now = new Date()
  const shipments = await svc.listShipments({ order_id: orderId }, { order: { shipped_at: "ASC" } })
  const out: ShipmentView[] = []
  for (const s of shipments) {
    const events = await svc.listTrackingEvents(
      { shipment_id: s.id, ...(opts.includeFuture ? {} : { occurred_at: { $lte: now } }) },
      { order: { occurred_at: "DESC" } },
    )
    // a free-text note doesn't move the parcel; status follows the latest real stop
    const latest = events.find((e) => e.code !== "note")?.code
    const status: ShipmentView["status"] =
      latest === "delivered" ? "delivered" : latest === "exception" ? "exception" : latest === "out_for_delivery" ? "out_for_delivery" : latest && latest !== "picked_up" ? "in_transit" : "shipped"
    out.push({
      id: s.id,
      fulfillment_id: s.fulfillment_id,
      carrier_code: s.carrier_code as CarrierCode,
      carrier_name: s.carrier_name,
      tracking_number: s.tracking_number,
      origin: s.origin,
      destination: s.destination,
      shipped_at: s.shipped_at,
      delivered_at: s.delivered_at,
      status,
      events: events.map((e) => ({ id: e.id, code: e.code as TrackingCode, location: e.location, note: e.note, occurred_at: e.occurred_at })),
    })
  }
  return out
}
