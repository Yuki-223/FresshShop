import { model } from "@medusajs/framework/utils"

/**
 * A product review.
 * - source "collected": imported from the Metagenics collection (step 4 of the plan)
 * - source "customer": written in our storefront
 */
const Review = model
  .define("review", {
    id: model.id({ prefix: "rev" }).primaryKey(),
    product_id: model.text(),
    author_name: model.text(),
    location: model.text().nullable(),
    rating: model.number(),
    title: model.text().nullable(),
    content: model.text(),
    source: model.enum(["collected", "customer"]).default("customer"),
    status: model.enum(["approved", "pending", "rejected"]).default("approved"),
    published_at: model.dateTime(),
  })
  .indexes([{ on: ["product_id", "status"] }])

export default Review
