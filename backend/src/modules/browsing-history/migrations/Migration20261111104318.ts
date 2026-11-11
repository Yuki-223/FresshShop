import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261111104318 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "browsing_history" drop constraint if exists "browsing_history_customer_id_product_id_unique";`);
    this.addSql(`create table if not exists "browsing_history" ("id" text not null, "customer_id" text not null, "product_id" text not null, "viewed_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "browsing_history_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_browsing_history_deleted_at" ON "browsing_history" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_browsing_history_customer_id_product_id_unique" ON "browsing_history" ("customer_id", "product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_browsing_history_customer_id_viewed_at" ON "browsing_history" ("customer_id", "viewed_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "browsing_history" cascade;`);
  }

}
