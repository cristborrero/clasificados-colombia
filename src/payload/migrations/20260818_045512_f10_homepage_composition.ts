import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "homepage_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_first" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_secondary" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"limit" numeric DEFAULT 6,
  	"category_id" integer,
  	"lead_count" numeric DEFAULT 2,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_latest" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"limit" numeric DEFAULT 6,
  	"category_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_investigations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"limit" numeric DEFAULT 6,
  	"category_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_analysis" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"limit" numeric DEFAULT 6,
  	"category_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_data" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"limit" numeric DEFAULT 6,
  	"category_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"limit" numeric DEFAULT 6,
  	"category_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_opinion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"limit" numeric DEFAULT 6,
  	"category_id" integer,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"investigations_id" integer,
  	"data_stories_id" integer
  );
  
  ALTER TABLE "homepage_blocks_hero" ADD CONSTRAINT "homepage_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_secondary" ADD CONSTRAINT "homepage_blocks_secondary_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_secondary" ADD CONSTRAINT "homepage_blocks_secondary_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_latest" ADD CONSTRAINT "homepage_blocks_latest_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_latest" ADD CONSTRAINT "homepage_blocks_latest_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_investigations" ADD CONSTRAINT "homepage_blocks_investigations_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_investigations" ADD CONSTRAINT "homepage_blocks_investigations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_analysis" ADD CONSTRAINT "homepage_blocks_analysis_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_analysis" ADD CONSTRAINT "homepage_blocks_analysis_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_data" ADD CONSTRAINT "homepage_blocks_data_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_data" ADD CONSTRAINT "homepage_blocks_data_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_video" ADD CONSTRAINT "homepage_blocks_video_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_video" ADD CONSTRAINT "homepage_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_opinion" ADD CONSTRAINT "homepage_blocks_opinion_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_blocks_opinion" ADD CONSTRAINT "homepage_blocks_opinion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_blocks_newsletter" ADD CONSTRAINT "homepage_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_investigations_fk" FOREIGN KEY ("investigations_id") REFERENCES "public"."investigations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_data_stories_fk" FOREIGN KEY ("data_stories_id") REFERENCES "public"."data_stories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "homepage_blocks_hero_order_idx" ON "homepage_blocks_hero" USING btree ("_order");
  CREATE INDEX "homepage_blocks_hero_parent_id_idx" ON "homepage_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_hero_path_idx" ON "homepage_blocks_hero" USING btree ("_path");
  CREATE INDEX "homepage_blocks_secondary_order_idx" ON "homepage_blocks_secondary" USING btree ("_order");
  CREATE INDEX "homepage_blocks_secondary_parent_id_idx" ON "homepage_blocks_secondary" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_secondary_path_idx" ON "homepage_blocks_secondary" USING btree ("_path");
  CREATE INDEX "homepage_blocks_secondary_category_idx" ON "homepage_blocks_secondary" USING btree ("category_id");
  CREATE INDEX "homepage_blocks_latest_order_idx" ON "homepage_blocks_latest" USING btree ("_order");
  CREATE INDEX "homepage_blocks_latest_parent_id_idx" ON "homepage_blocks_latest" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_latest_path_idx" ON "homepage_blocks_latest" USING btree ("_path");
  CREATE INDEX "homepage_blocks_latest_category_idx" ON "homepage_blocks_latest" USING btree ("category_id");
  CREATE INDEX "homepage_blocks_investigations_order_idx" ON "homepage_blocks_investigations" USING btree ("_order");
  CREATE INDEX "homepage_blocks_investigations_parent_id_idx" ON "homepage_blocks_investigations" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_investigations_path_idx" ON "homepage_blocks_investigations" USING btree ("_path");
  CREATE INDEX "homepage_blocks_investigations_category_idx" ON "homepage_blocks_investigations" USING btree ("category_id");
  CREATE INDEX "homepage_blocks_analysis_order_idx" ON "homepage_blocks_analysis" USING btree ("_order");
  CREATE INDEX "homepage_blocks_analysis_parent_id_idx" ON "homepage_blocks_analysis" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_analysis_path_idx" ON "homepage_blocks_analysis" USING btree ("_path");
  CREATE INDEX "homepage_blocks_analysis_category_idx" ON "homepage_blocks_analysis" USING btree ("category_id");
  CREATE INDEX "homepage_blocks_data_order_idx" ON "homepage_blocks_data" USING btree ("_order");
  CREATE INDEX "homepage_blocks_data_parent_id_idx" ON "homepage_blocks_data" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_data_path_idx" ON "homepage_blocks_data" USING btree ("_path");
  CREATE INDEX "homepage_blocks_data_category_idx" ON "homepage_blocks_data" USING btree ("category_id");
  CREATE INDEX "homepage_blocks_video_order_idx" ON "homepage_blocks_video" USING btree ("_order");
  CREATE INDEX "homepage_blocks_video_parent_id_idx" ON "homepage_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_video_path_idx" ON "homepage_blocks_video" USING btree ("_path");
  CREATE INDEX "homepage_blocks_video_category_idx" ON "homepage_blocks_video" USING btree ("category_id");
  CREATE INDEX "homepage_blocks_opinion_order_idx" ON "homepage_blocks_opinion" USING btree ("_order");
  CREATE INDEX "homepage_blocks_opinion_parent_id_idx" ON "homepage_blocks_opinion" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_opinion_path_idx" ON "homepage_blocks_opinion" USING btree ("_path");
  CREATE INDEX "homepage_blocks_opinion_category_idx" ON "homepage_blocks_opinion" USING btree ("category_id");
  CREATE INDEX "homepage_blocks_newsletter_order_idx" ON "homepage_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "homepage_blocks_newsletter_parent_id_idx" ON "homepage_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "homepage_blocks_newsletter_path_idx" ON "homepage_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_articles_id_idx" ON "homepage_rels" USING btree ("articles_id");
  CREATE INDEX "homepage_rels_investigations_id_idx" ON "homepage_rels" USING btree ("investigations_id");
  CREATE INDEX "homepage_rels_data_stories_id_idx" ON "homepage_rels" USING btree ("data_stories_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "homepage_blocks_hero" CASCADE;
  DROP TABLE "homepage_blocks_secondary" CASCADE;
  DROP TABLE "homepage_blocks_latest" CASCADE;
  DROP TABLE "homepage_blocks_investigations" CASCADE;
  DROP TABLE "homepage_blocks_analysis" CASCADE;
  DROP TABLE "homepage_blocks_data" CASCADE;
  DROP TABLE "homepage_blocks_video" CASCADE;
  DROP TABLE "homepage_blocks_opinion" CASCADE;
  DROP TABLE "homepage_blocks_newsletter" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;`)
}
