import { Module } from "@medusajs/framework/utils"
import BrowsingHistoryModuleService from "./service"

export const BROWSING_HISTORY_MODULE = "browsingHistory"

export default Module(BROWSING_HISTORY_MODULE, { service: BrowsingHistoryModuleService })
