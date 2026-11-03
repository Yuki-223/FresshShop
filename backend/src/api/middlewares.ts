import {
  configureStoreSearch,
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { AdminPostReviews } from "./admin/reviews/validators"
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
