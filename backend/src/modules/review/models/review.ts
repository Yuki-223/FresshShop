import { model } from "@medusajs/framework/utils"

/**
 * A product review.
 * - source "collected": imported from the Metagenics collection (step 4 of the plan)
 * - source "customer": written in our storefront
 * - source "demo": sample reviews generated for the demo (scripts/import-demo-reviews.mjs), shown
 *   with a "Sample review" tag and not counted in the rating; removable with `--remove`
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
    source: model.enum(["collected", "customer", "demo"]).default("customer"),
    status: model.enum(["approved", "pending", "rejected"]).default("approved"),
    published_at: model.dateTime(),
  })
  .indexes([{ on: ["product_id", "status"] }])

export default Review
