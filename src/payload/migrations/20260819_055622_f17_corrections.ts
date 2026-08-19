import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_corrections_type" AS ENUM('correction', 'clarification', 'update', 'editor_note');
  CREATE TABLE "corrections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_corrections_type" DEFAULT 'correction' NOT NULL,
  	"summary" varchar NOT NULL,
  	"issued_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "corrections_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"investigations_id" integer,
  	"opinions_id" integer,
  	"data_stories_id" integer,
  	"video_stories_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "corrections_id" integer;
  ALTER TABLE "corrections_rels" ADD CONSTRAINT "corrections_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."corrections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "corrections_rels" ADD CONSTRAINT "corrections_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "corrections_rels" ADD CONSTRAINT "corrections_rels_investigations_fk" FOREIGN KEY ("investigations_id") REFERENCES "public"."investigations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "corrections_rels" ADD CONSTRAINT "corrections_rels_opinions_fk" FOREIGN KEY ("opinions_id") REFERENCES "public"."opinions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "corrections_rels" ADD CONSTRAINT "corrections_rels_data_stories_fk" FOREIGN KEY ("data_stories_id") REFERENCES "public"."data_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "corrections_rels" ADD CONSTRAINT "corrections_rels_video_stories_fk" FOREIGN KEY ("video_stories_id") REFERENCES "public"."video_stories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "corrections_type_idx" ON "corrections" USING btree ("type");
  CREATE INDEX "corrections_issued_at_idx" ON "corrections" USING btree ("issued_at");
  CREATE INDEX "corrections_updated_at_idx" ON "corrections" USING btree ("updated_at");
  CREATE INDEX "corrections_created_at_idx" ON "corrections" USING btree ("created_at");
  CREATE INDEX "corrections_rels_order_idx" ON "corrections_rels" USING btree ("order");
  CREATE INDEX "corrections_rels_parent_idx" ON "corrections_rels" USING btree ("parent_id");
  CREATE INDEX "corrections_rels_path_idx" ON "corrections_rels" USING btree ("path");
  CREATE INDEX "corrections_rels_articles_id_idx" ON "corrections_rels" USING btree ("articles_id");
  CREATE INDEX "corrections_rels_investigations_id_idx" ON "corrections_rels" USING btree ("investigations_id");
  CREATE INDEX "corrections_rels_opinions_id_idx" ON "corrections_rels" USING btree ("opinions_id");
  CREATE INDEX "corrections_rels_data_stories_id_idx" ON "corrections_rels" USING btree ("data_stories_id");
  CREATE INDEX "corrections_rels_video_stories_id_idx" ON "corrections_rels" USING btree ("video_stories_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_corrections_fk" FOREIGN KEY ("corrections_id") REFERENCES "public"."corrections"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_corrections_id_idx" ON "payload_locked_documents_rels" USING btree ("corrections_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "corrections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "corrections_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "corrections" CASCADE;
  DROP TABLE "corrections_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_corrections_fk";
  
  DROP INDEX "payload_locked_documents_rels_corrections_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "corrections_id";
  DROP TYPE "public"."enum_corrections_type";`)
}
