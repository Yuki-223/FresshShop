import {
  authenticate,
  configureStoreSearch,
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { AdminPostReviews } from "./admin/reviews/validators"
import { StorePostPurchaseItem } from "./store/carts/[id]/purchase-items/validators"
import { StorePostBrowsingHistory } from "./store/customers/me/browsing-history/validators"
import { StorePostCustomerPassword } from "./store/customers/me/password/validators"
import { StorePostReview } from "./store/reviews/validators"

// The product index declares filterable `status` and `sales_channel_ids`, so
// the route narrows it to published products in the key's sales channels.
export default defineMiddlewares({
  routes: [
    {
      method: ["POST"],
      matcher: "/admin/products",
      bodyParser: { sizeLimit: "5mb" },
      middlewares: [],
    },
    {
      method: ["POST"],
      matcher: "/admin/reviews",
      middlewares: [validateAndTransformBody(AdminPostReviews)],
    },
    {
      method: ["POST"],
      matcher: "/store/carts/:id/purchase-items",
      middlewares: [validateAndTransformBody(StorePostPurchaseItem)],
    },
    {
      method: ["POST"],
      matcher: "/store/customers/me/password",
      middlewares: [authenticate("customer", ["bearer"]), validateAndTransformBody(StorePostCustomerPassword)],
    },
    // browsing history: always the signed-in customer's own
    {
      matcher: "/store/customers/me/browsing-history*",
      middlewares: [authenticate("customer", ["bearer"])],
    },
    {
      method: ["POST"],
      matcher: "/store/customers/me/browsing-history",
      middlewares: [validateAndTransformBody(StorePostBrowsingHistory)],
    },
    {
      method: ["POST"],
      matcher: "/store/reviews",
      middlewares: [validateAndTransformBody(StorePostReview)],
    },
    {
      method: ["POST"],
      matcher: "/store/search",
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },
  ],
})
