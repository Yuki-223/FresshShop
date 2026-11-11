import type { Context } from "@medusajs/framework/types"
import type { EntityManager } from "@medusajs/framework/mikro-orm/knex"
import { generateEntityId, InjectManager, InjectTransactionManager, MedusaContext, MedusaService } from "@medusajs/framework/utils"
import BrowsingHistory from "./models/browsing-history"

/** How many products are kept per customer (the oldest are dropped). */
export const HISTORY_LIMIT = 100

export type ViewedProduct = { product_id: string; viewed_at: Date }

/** CRUD (listAndCountBrowsingHistories, deleteBrowsingHistories, …) plus `record`. */
class BrowsingHistoryModuleService extends MedusaService({ BrowsingHistory }) {
  /**
   * Adds products to a customer's history: new ones are inserted, known ones keep the later
   * of the two times (so merging an older guest history never moves a product back), then
   * everything past the newest HISTORY_LIMIT is deleted. One statement per product, so two
   * quick views of the same product can't create a duplicate.
   */
  @InjectManager()
  async record(customerId: string, items: ViewedProduct[], @MedusaContext() sharedContext: Context<EntityManager> = {}): Promise<void> {
    await this.record_(customerId, items, sharedContext)
  }

  @InjectTransactionManager()
  protected async record_(customerId: string, items: ViewedProduct[], @MedusaContext() sharedContext: Context<EntityManager> = {}): Promise<void> {
    const manager = sharedContext.transactionManager!
    for (const item of items) {
      await manager.execute(
        `insert into "browsing_history" ("id", "customer_id", "product_id", "viewed_at", "created_at", "updated_at")
         values (?, ?, ?, ?, now(), now())
         on conflict ("customer_id", "product_id") where "deleted_at" is null
         do update set "viewed_at" = greatest("browsing_history"."viewed_at", excluded."viewed_at"), "updated_at" = now()`,
        [generateEntityId(undefined, "bh"), customerId, item.product_id, item.viewed_at],
      )
    }
    await manager.execute(
      `delete from "browsing_history" where "customer_id" = ? and "id" not in (
         select "id" from "browsing_history" where "customer_id" = ? and "deleted_at" is null
         order by "viewed_at" desc limit ?)`,
      [customerId, customerId, HISTORY_LIMIT],
    )
  }
}

export default BrowsingHistoryModuleService
