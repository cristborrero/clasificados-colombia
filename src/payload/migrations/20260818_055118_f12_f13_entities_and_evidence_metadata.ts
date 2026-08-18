import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "categories" ADD COLUMN "parent_id" integer;
  ALTER TABLE "evidence" ADD COLUMN "document_type" varchar;
  ALTER TABLE "evidence" ADD COLUMN "institution" varchar;
  ALTER TABLE "evidence" ADD COLUMN "document_date" timestamp(3) with time zone;
  ALTER TABLE "evidence" ADD COLUMN "page_count" numeric;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_categories_id_fk";
  
  DROP INDEX "categories_parent_idx";
  ALTER TABLE "categories" DROP COLUMN "parent_id";
  ALTER TABLE "evidence" DROP COLUMN "document_type";
  ALTER TABLE "evidence" DROP COLUMN "institution";
  ALTER TABLE "evidence" DROP COLUMN "document_date";
  ALTER TABLE "evidence" DROP COLUMN "page_count";`)
}
