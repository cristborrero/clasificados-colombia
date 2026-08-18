import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_navigation_primary_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_navigation_secondary_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_navigation_footer_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_breaking_news_severity" AS ENUM('breaking', 'alert', 'developing', 'confirmed');
  CREATE TABLE "site_settings_organization_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'Clasificados Colombia' NOT NULL,
  	"site_description" varchar DEFAULT 'Investigamos. Informamos. No callamos.',
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"contact_address" varchar,
  	"organization_legal_name" varchar,
  	"organization_logo_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_primary" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_navigation_primary_link_type" DEFAULT 'internal',
  	"category_id" integer,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_secondary" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_navigation_secondary_link_type" DEFAULT 'internal',
  	"category_id" integer,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_navigation_footer_links_link_type" DEFAULT 'internal',
  	"category_id" integer,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "navigation_footer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "breaking_news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT false,
  	"severity" "enum_breaking_news_severity" DEFAULT 'breaking' NOT NULL,
  	"headline" varchar NOT NULL,
  	"description" varchar,
  	"related_article_id" integer,
  	"starts_at" timestamp(3) with time zone NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "site_settings_organization_same_as" ADD CONSTRAINT "site_settings_organization_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_organization_logo_id_media_id_fk" FOREIGN KEY ("organization_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_primary" ADD CONSTRAINT "navigation_primary_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_primary" ADD CONSTRAINT "navigation_primary_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_secondary" ADD CONSTRAINT "navigation_secondary_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_secondary" ADD CONSTRAINT "navigation_secondary_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_links" ADD CONSTRAINT "navigation_footer_links_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_footer_links" ADD CONSTRAINT "navigation_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer" ADD CONSTRAINT "navigation_footer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_social" ADD CONSTRAINT "navigation_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "breaking_news" ADD CONSTRAINT "breaking_news_related_article_id_articles_id_fk" FOREIGN KEY ("related_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_settings_organization_same_as_order_idx" ON "site_settings_organization_same_as" USING btree ("_order");
  CREATE INDEX "site_settings_organization_same_as_parent_id_idx" ON "site_settings_organization_same_as" USING btree ("_parent_id");
  CREATE INDEX "site_settings_organization_organization_logo_idx" ON "site_settings" USING btree ("organization_logo_id");
  CREATE INDEX "navigation_primary_order_idx" ON "navigation_primary" USING btree ("_order");
  CREATE INDEX "navigation_primary_parent_id_idx" ON "navigation_primary" USING btree ("_parent_id");
  CREATE INDEX "navigation_primary_category_idx" ON "navigation_primary" USING btree ("category_id");
  CREATE INDEX "navigation_secondary_order_idx" ON "navigation_secondary" USING btree ("_order");
  CREATE INDEX "navigation_secondary_parent_id_idx" ON "navigation_secondary" USING btree ("_parent_id");
  CREATE INDEX "navigation_secondary_category_idx" ON "navigation_secondary" USING btree ("category_id");
  CREATE INDEX "navigation_footer_links_order_idx" ON "navigation_footer_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_links_parent_id_idx" ON "navigation_footer_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_links_category_idx" ON "navigation_footer_links" USING btree ("category_id");
  CREATE INDEX "navigation_footer_order_idx" ON "navigation_footer" USING btree ("_order");
  CREATE INDEX "navigation_footer_parent_id_idx" ON "navigation_footer" USING btree ("_parent_id");
  CREATE INDEX "navigation_social_order_idx" ON "navigation_social" USING btree ("_order");
  CREATE INDEX "navigation_social_parent_id_idx" ON "navigation_social" USING btree ("_parent_id");
  CREATE INDEX "breaking_news_related_article_idx" ON "breaking_news" USING btree ("related_article_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_organization_same_as" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "navigation_primary" CASCADE;
  DROP TABLE "navigation_secondary" CASCADE;
  DROP TABLE "navigation_footer_links" CASCADE;
  DROP TABLE "navigation_footer" CASCADE;
  DROP TABLE "navigation_social" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "breaking_news" CASCADE;
  DROP TYPE "public"."enum_navigation_primary_link_type";
  DROP TYPE "public"."enum_navigation_secondary_link_type";
  DROP TYPE "public"."enum_navigation_footer_links_link_type";
  DROP TYPE "public"."enum_breaking_news_severity";`)
}
