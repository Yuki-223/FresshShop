import { Module } from "@medusajs/framework/utils"
import ShipmentTrackingModuleService from "./service"

export const SHIPMENT_TRACKING_MODULE = "shipmentTracking"

export default Module(SHIPMENT_TRACKING_MODULE, { service: ShipmentTrackingModuleService })
