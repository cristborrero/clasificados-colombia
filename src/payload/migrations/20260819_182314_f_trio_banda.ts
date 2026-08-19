import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "homepage_blocks_trio" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"investigations_title" varchar DEFAULT 'Investigaciones',
  	"analysis_title" varchar DEFAULT 'Análisis destacado',
  	"data_title" varchar DEFAULT 'Datos clave',
  	"block_name" varchar
  );
  
  ALTER TABLE "homepage_blocks_trio" ADD CONSTRAINT "homepage_blocks_trio_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "homepage_blocks_trio_order_idx" ON "homepage_blocks_trio" USING btree ("_order");
  CREATE INDEX "homepage_blocks_trio_parent_id_idx" ON "homepage_blocks_trio" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_trio_path_idx" ON "homepage_blocks_trio" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "homepage_blocks_trio" CASCADE;`)
}
