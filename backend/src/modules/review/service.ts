import { MedusaService } from "@medusajs/framework/utils"
import Review from "./models/review"

/** CRUD for reviews: listAndCountReviews, createReviews, updateReviews, deleteReviews, … */
class ReviewModuleService extends MedusaService({ Review }) {}

export default ReviewModuleService
