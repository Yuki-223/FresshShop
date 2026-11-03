import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261103123008 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "review" ("id" text not null, "product_id" text not null, "author_name" text not null, "location" text null, "rating" integer not null, "title" text null, "content" text not null, "source" text check ("source" in ('collected', 'customer')) not null default 'customer', "status" text check ("status" in ('approved', 'pending', 'rejected')) not null default 'approved', "published_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_deleted_at" ON "review" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_product_id_status" ON "review" ("product_id", "status") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "review" cascade;`);
  }

}
