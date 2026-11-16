import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261116155835 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "shipment" drop constraint if exists "shipment_fulfillment_id_unique";`);
    this.addSql(`create table if not exists "shipment" ("id" text not null, "order_id" text not null, "fulfillment_id" text not null, "carrier_code" text not null, "carrier_name" text not null, "tracking_number" text not null, "origin" text not null, "destination" text not null, "shipped_at" timestamptz not null, "delivered_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "shipment_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_shipment_fulfillment_id_unique" ON "shipment" ("fulfillment_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shipment_deleted_at" ON "shipment" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shipment_order_id" ON "shipment" ("order_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "tracking_event" ("id" text not null, "shipment_id" text not null, "code" text check ("code" in ('picked_up', 'departed', 'arrived', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'note')) not null, "location" text null, "note" text null, "occurred_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "tracking_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tracking_event_shipment_id" ON "tracking_event" ("shipment_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tracking_event_deleted_at" ON "tracking_event" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tracking_event_shipment_id_occurred_at" ON "tracking_event" ("shipment_id", "occurred_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "tracking_event" add constraint "tracking_event_shipment_id_foreign" foreign key ("shipment_id") references "shipment" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "tracking_event" drop constraint if exists "tracking_event_shipment_id_foreign";`);

    this.addSql(`drop table if exists "shipment" cascade;`);

    this.addSql(`drop table if exists "tracking_event" cascade;`);
  }

}
