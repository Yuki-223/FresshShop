import { MedusaService } from "@medusajs/framework/utils"
import Shipment from "./models/shipment"
import TrackingEvent from "./models/tracking-event"

/** Generated CRUD: listShipments, createShipments, createTrackingEvents, deleteTrackingEvents, … */
class ShipmentTrackingModuleService extends MedusaService({ Shipment, TrackingEvent }) {}

export default ShipmentTrackingModuleService
