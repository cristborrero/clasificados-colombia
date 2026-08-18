import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "investigations_rels" ADD COLUMN "topics_id" integer;
  ALTER TABLE "_investigations_v_rels" ADD COLUMN "topics_id" integer;
  ALTER TABLE "investigations_rels" ADD CONSTRAINT "investigations_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_investigations_v_rels" ADD CONSTRAINT "_investigations_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "investigations_rels_topics_id_idx" ON "investigations_rels" USING btree ("topics_id");
  CREATE INDEX "_investigations_v_rels_topics_id_idx" ON "_investigations_v_rels" USING btree ("topics_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "investigations_rels" DROP CONSTRAINT "investigations_rels_topics_fk";
  
  ALTER TABLE "_investigations_v_rels" DROP CONSTRAINT "_investigations_v_rels_topics_fk";
  
  DROP INDEX "investigations_rels_topics_id_idx";
  DROP INDEX "_investigations_v_rels_topics_id_idx";
  ALTER TABLE "investigations_rels" DROP COLUMN "topics_id";
  ALTER TABLE "_investigations_v_rels" DROP COLUMN "topics_id";`)
}
