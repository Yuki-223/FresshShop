import { model } from "@medusajs/framework/utils"

/**
 * One product a signed-in customer has looked at. A product appears once per customer:
 * looking at it again only moves `viewed_at` forward. Only the newest 100 are kept
 * (BrowsingHistoryModuleService.record). Guests keep their history in the browser and it is
 * merged in here when they sign in.
 */
const BrowsingHistory = model
  .define("browsing_history", {
    id: model.id({ prefix: "bh" }).primaryKey(),
    customer_id: model.text(),
    product_id: model.text(),
    viewed_at: model.dateTime(),
  })
  .indexes([
    { on: ["customer_id", "product_id"], unique: true },
    { on: ["customer_id", "viewed_at"] },
  ])

export default BrowsingHistory
