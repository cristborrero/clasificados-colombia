import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "authors_expertise" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"area" varchar NOT NULL
  );
  
  CREATE TABLE "authors_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"slug_locked" boolean DEFAULT false,
  	"job_title" varchar,
  	"short_bio" varchar,
  	"bio" varchar,
  	"email_public" varchar,
  	"active" boolean DEFAULT true,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical" varchar,
  	"seo_og_title" varchar,
  	"seo_og_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_no_follow" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"slug_locked" boolean DEFAULT false,
  	"description" varchar,
  	"navigation_label" varchar,
  	"order" numeric DEFAULT 0,
  	"active" boolean DEFAULT true,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical" varchar,
  	"seo_og_title" varchar,
  	"seo_og_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_no_follow" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"slug_locked" boolean DEFAULT false,
  	"description" varchar,
  	"active" boolean DEFAULT true,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical" varchar,
  	"seo_og_title" varchar,
  	"seo_og_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_no_follow" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "topics_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"topics_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "authors_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "topics_id" integer;
  ALTER TABLE "authors_expertise" ADD CONSTRAINT "authors_expertise_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors_social_links" ADD CONSTRAINT "authors_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "authors_expertise_order_idx" ON "authors_expertise" USING btree ("_order");
  CREATE INDEX "authors_expertise_parent_id_idx" ON "authors_expertise" USING btree ("_parent_id");
  CREATE INDEX "authors_social_links_order_idx" ON "authors_social_links" USING btree ("_order");
  CREATE INDEX "authors_social_links_parent_id_idx" ON "authors_social_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "authors_slug_idx" ON "authors" USING btree ("slug");
  CREATE INDEX "authors_active_idx" ON "authors" USING btree ("active");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_active_idx" ON "categories" USING btree ("active");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "topics_slug_idx" ON "topics" USING btree ("slug");
  CREATE INDEX "topics_active_idx" ON "topics" USING btree ("active");
  CREATE INDEX "topics_updated_at_idx" ON "topics" USING btree ("updated_at");
  CREATE INDEX "topics_created_at_idx" ON "topics" USING btree ("created_at");
  CREATE INDEX "topics_rels_order_idx" ON "topics_rels" USING btree ("order");
  CREATE INDEX "topics_rels_parent_idx" ON "topics_rels" USING btree ("parent_id");
  CREATE INDEX "topics_rels_path_idx" ON "topics_rels" USING btree ("path");
  CREATE INDEX "topics_rels_topics_id_idx" ON "topics_rels" USING btree ("topics_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("topics_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "authors_expertise" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "authors_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "authors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "topics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "topics_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "authors_expertise" CASCADE;
  DROP TABLE "authors_social_links" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "topics" CASCADE;
  DROP TABLE "topics_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_authors_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_topics_fk";
  
  DROP INDEX "payload_locked_documents_rels_authors_id_idx";
  DROP INDEX "payload_locked_documents_rels_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_topics_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "authors_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "topics_id";`)
}
