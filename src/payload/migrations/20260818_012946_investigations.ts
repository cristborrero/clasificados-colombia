import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_investigations_key_findings_importance" AS ENUM('primary', 'normal', 'context');
  CREATE TYPE "public"."enum_investigations_workflow_editorial_status" AS ENUM('draft', 'editing', 'fact_check', 'legal_review', 'approved', 'scheduled', 'published', 'archived');
  CREATE TYPE "public"."enum_investigations_workflow_fact_check_status" AS ENUM('not_required', 'not_started', 'in_progress', 'verified', 'issues_found');
  CREATE TYPE "public"."enum_investigations_workflow_legal_status" AS ENUM('not_required', 'pending', 'approved', 'changes_required');
  CREATE TYPE "public"."enum_investigations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__investigations_v_version_key_findings_importance" AS ENUM('primary', 'normal', 'context');
  CREATE TYPE "public"."enum__investigations_v_version_workflow_editorial_status" AS ENUM('draft', 'editing', 'fact_check', 'legal_review', 'approved', 'scheduled', 'published', 'archived');
  CREATE TYPE "public"."enum__investigations_v_version_workflow_fact_check_status" AS ENUM('not_required', 'not_started', 'in_progress', 'verified', 'issues_found');
  CREATE TYPE "public"."enum__investigations_v_version_workflow_legal_status" AS ENUM('not_required', 'pending', 'approved', 'changes_required');
  CREATE TYPE "public"."enum__investigations_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "investigations_key_findings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"description" varchar,
  	"importance" "enum_investigations_key_findings_importance" DEFAULT 'normal'
  );
  
  CREATE TABLE "investigations_chapters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"intro" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "investigations_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "investigations_updates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"summary" varchar
  );
  
  CREATE TABLE "investigations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"slug_locked" boolean DEFAULT false,
  	"dek" varchar,
  	"hero_image_id" integer,
  	"hero_caption_override" varchar,
  	"summary" varchar,
  	"methodology" varchar,
  	"created_by_id" integer,
  	"assigned_editor_id" integer,
  	"workflow_editorial_status" "enum_investigations_workflow_editorial_status" DEFAULT 'draft',
  	"workflow_fact_check_status" "enum_investigations_workflow_fact_check_status" DEFAULT 'not_started',
  	"workflow_legal_status" "enum_investigations_workflow_legal_status" DEFAULT 'pending',
  	"workflow_review_notes" varchar,
  	"publication_published_at" timestamp(3) with time zone,
  	"publication_first_published_at" timestamp(3) with time zone,
  	"publication_modified_at" timestamp(3) with time zone,
  	"publication_scheduled_at" timestamp(3) with time zone,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_canonical" varchar,
  	"seo_og_title" varchar,
  	"seo_og_description" varchar,
  	"seo_no_index" boolean DEFAULT false,
  	"seo_no_follow" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_investigations_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "investigations_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"authors_id" integer,
  	"sources_id" integer,
  	"people_id" integer,
  	"organizations_id" integer
  );
  
  CREATE TABLE "_investigations_v_version_key_findings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"headline" varchar,
  	"description" varchar,
  	"importance" "enum__investigations_v_version_key_findings_importance" DEFAULT 'normal',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_investigations_v_version_chapters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"intro" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_investigations_v_version_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_investigations_v_version_updates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone,
  	"summary" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_investigations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_slug_locked" boolean DEFAULT false,
  	"version_dek" varchar,
  	"version_hero_image_id" integer,
  	"version_hero_caption_override" varchar,
  	"version_summary" varchar,
  	"version_methodology" varchar,
  	"version_created_by_id" integer,
  	"version_assigned_editor_id" integer,
  	"version_workflow_editorial_status" "enum__investigations_v_version_workflow_editorial_status" DEFAULT 'draft',
  	"version_workflow_fact_check_status" "enum__investigations_v_version_workflow_fact_check_status" DEFAULT 'not_started',
  	"version_workflow_legal_status" "enum__investigations_v_version_workflow_legal_status" DEFAULT 'pending',
  	"version_workflow_review_notes" varchar,
  	"version_publication_published_at" timestamp(3) with time zone,
  	"version_publication_first_published_at" timestamp(3) with time zone,
  	"version_publication_modified_at" timestamp(3) with time zone,
  	"version_publication_scheduled_at" timestamp(3) with time zone,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_og_title" varchar,
  	"version_seo_og_description" varchar,
  	"version_seo_no_index" boolean DEFAULT false,
  	"version_seo_no_follow" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__investigations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_investigations_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"authors_id" integer,
  	"sources_id" integer,
  	"people_id" integer,
  	"organizations_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "investigations_id" integer;
  ALTER TABLE "investigations_key_findings" ADD CONSTRAINT "investigations_key_findings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."investigations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "investigations_chapters" ADD CONSTRAINT "investigations_chapters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."investigations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "investigations_timeline" ADD CONSTRAINT "investigations_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."investigations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "investigations_updates" ADD CONSTRAINT "investigations_updates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."investigations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "investigations" ADD CONSTRAINT "investigations_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "investigations" ADD CONSTRAINT "investigations_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "investigations" ADD CONSTRAINT "investigations_assigned_editor_id_users_id_fk" FOREIGN KEY ("assigned_editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "investigations_rels" ADD CONSTRAINT "investigations_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."investigations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "investigations_rels" ADD CONSTRAINT "investigations_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "investigations_rels" ADD CONSTRAINT "investigations_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "investigations_rels" ADD CONSTRAINT "investigations_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "investigations_rels" ADD CONSTRAINT "investigations_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_investigations_v_version_key_findings" ADD CONSTRAINT "_investigations_v_version_key_findings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_investigations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_investigations_v_version_chapters" ADD CONSTRAINT "_investigations_v_version_chapters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_investigations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_investigations_v_version_timeline" ADD CONSTRAINT "_investigations_v_version_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_investigations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_investigations_v_version_updates" ADD CONSTRAINT "_investigations_v_version_updates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_investigations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_investigations_v" ADD CONSTRAINT "_investigations_v_parent_id_investigations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."investigations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_investigations_v" ADD CONSTRAINT "_investigations_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_investigations_v" ADD CONSTRAINT "_investigations_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_investigations_v" ADD CONSTRAINT "_investigations_v_version_assigned_editor_id_users_id_fk" FOREIGN KEY ("version_assigned_editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_investigations_v_rels" ADD CONSTRAINT "_investigations_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_investigations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_investigations_v_rels" ADD CONSTRAINT "_investigations_v_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_investigations_v_rels" ADD CONSTRAINT "_investigations_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_investigations_v_rels" ADD CONSTRAINT "_investigations_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_investigations_v_rels" ADD CONSTRAINT "_investigations_v_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "investigations_key_findings_order_idx" ON "investigations_key_findings" USING btree ("_order");
  CREATE INDEX "investigations_key_findings_parent_id_idx" ON "investigations_key_findings" USING btree ("_parent_id");
  CREATE INDEX "investigations_chapters_order_idx" ON "investigations_chapters" USING btree ("_order");
  CREATE INDEX "investigations_chapters_parent_id_idx" ON "investigations_chapters" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "investigations_chapters_slug_idx" ON "investigations_chapters" USING btree ("slug");
  CREATE INDEX "investigations_timeline_order_idx" ON "investigations_timeline" USING btree ("_order");
  CREATE INDEX "investigations_timeline_parent_id_idx" ON "investigations_timeline" USING btree ("_parent_id");
  CREATE INDEX "investigations_updates_order_idx" ON "investigations_updates" USING btree ("_order");
  CREATE INDEX "investigations_updates_parent_id_idx" ON "investigations_updates" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "investigations_slug_idx" ON "investigations" USING btree ("slug");
  CREATE INDEX "investigations_hero_hero_image_idx" ON "investigations" USING btree ("hero_image_id");
  CREATE INDEX "investigations_created_by_idx" ON "investigations" USING btree ("created_by_id");
  CREATE INDEX "investigations_assigned_editor_idx" ON "investigations" USING btree ("assigned_editor_id");
  CREATE INDEX "investigations_workflow_workflow_editorial_status_idx" ON "investigations" USING btree ("workflow_editorial_status");
  CREATE INDEX "investigations_publication_publication_published_at_idx" ON "investigations" USING btree ("publication_published_at");
  CREATE INDEX "investigations_updated_at_idx" ON "investigations" USING btree ("updated_at");
  CREATE INDEX "investigations_created_at_idx" ON "investigations" USING btree ("created_at");
  CREATE INDEX "investigations__status_idx" ON "investigations" USING btree ("_status");
  CREATE INDEX "investigations_rels_order_idx" ON "investigations_rels" USING btree ("order");
  CREATE INDEX "investigations_rels_parent_idx" ON "investigations_rels" USING btree ("parent_id");
  CREATE INDEX "investigations_rels_path_idx" ON "investigations_rels" USING btree ("path");
  CREATE INDEX "investigations_rels_authors_id_idx" ON "investigations_rels" USING btree ("authors_id");
  CREATE INDEX "investigations_rels_sources_id_idx" ON "investigations_rels" USING btree ("sources_id");
  CREATE INDEX "investigations_rels_people_id_idx" ON "investigations_rels" USING btree ("people_id");
  CREATE INDEX "investigations_rels_organizations_id_idx" ON "investigations_rels" USING btree ("organizations_id");
  CREATE INDEX "_investigations_v_version_key_findings_order_idx" ON "_investigations_v_version_key_findings" USING btree ("_order");
  CREATE INDEX "_investigations_v_version_key_findings_parent_id_idx" ON "_investigations_v_version_key_findings" USING btree ("_parent_id");
  CREATE INDEX "_investigations_v_version_chapters_order_idx" ON "_investigations_v_version_chapters" USING btree ("_order");
  CREATE INDEX "_investigations_v_version_chapters_parent_id_idx" ON "_investigations_v_version_chapters" USING btree ("_parent_id");
  CREATE INDEX "_investigations_v_version_chapters_slug_idx" ON "_investigations_v_version_chapters" USING btree ("slug");
  CREATE INDEX "_investigations_v_version_timeline_order_idx" ON "_investigations_v_version_timeline" USING btree ("_order");
  CREATE INDEX "_investigations_v_version_timeline_parent_id_idx" ON "_investigations_v_version_timeline" USING btree ("_parent_id");
  CREATE INDEX "_investigations_v_version_updates_order_idx" ON "_investigations_v_version_updates" USING btree ("_order");
  CREATE INDEX "_investigations_v_version_updates_parent_id_idx" ON "_investigations_v_version_updates" USING btree ("_parent_id");
  CREATE INDEX "_investigations_v_parent_idx" ON "_investigations_v" USING btree ("parent_id");
  CREATE INDEX "_investigations_v_version_version_slug_idx" ON "_investigations_v" USING btree ("version_slug");
  CREATE INDEX "_investigations_v_version_hero_version_hero_image_idx" ON "_investigations_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_investigations_v_version_version_created_by_idx" ON "_investigations_v" USING btree ("version_created_by_id");
  CREATE INDEX "_investigations_v_version_version_assigned_editor_idx" ON "_investigations_v" USING btree ("version_assigned_editor_id");
  CREATE INDEX "_investigations_v_version_workflow_version_workflow_edit_idx" ON "_investigations_v" USING btree ("version_workflow_editorial_status");
  CREATE INDEX "_investigations_v_version_publication_version_publicatio_idx" ON "_investigations_v" USING btree ("version_publication_published_at");
  CREATE INDEX "_investigations_v_version_version_updated_at_idx" ON "_investigations_v" USING btree ("version_updated_at");
  CREATE INDEX "_investigations_v_version_version_created_at_idx" ON "_investigations_v" USING btree ("version_created_at");
  CREATE INDEX "_investigations_v_version_version__status_idx" ON "_investigations_v" USING btree ("version__status");
  CREATE INDEX "_investigations_v_created_at_idx" ON "_investigations_v" USING btree ("created_at");
  CREATE INDEX "_investigations_v_updated_at_idx" ON "_investigations_v" USING btree ("updated_at");
  CREATE INDEX "_investigations_v_latest_idx" ON "_investigations_v" USING btree ("latest");
  CREATE INDEX "_investigations_v_rels_order_idx" ON "_investigations_v_rels" USING btree ("order");
  CREATE INDEX "_investigations_v_rels_parent_idx" ON "_investigations_v_rels" USING btree ("parent_id");
  CREATE INDEX "_investigations_v_rels_path_idx" ON "_investigations_v_rels" USING btree ("path");
  CREATE INDEX "_investigations_v_rels_authors_id_idx" ON "_investigations_v_rels" USING btree ("authors_id");
  CREATE INDEX "_investigations_v_rels_sources_id_idx" ON "_investigations_v_rels" USING btree ("sources_id");
  CREATE INDEX "_investigations_v_rels_people_id_idx" ON "_investigations_v_rels" USING btree ("people_id");
  CREATE INDEX "_investigations_v_rels_organizations_id_idx" ON "_investigations_v_rels" USING btree ("organizations_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_investigations_fk" FOREIGN KEY ("investigations_id") REFERENCES "public"."investigations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_investigations_id_idx" ON "payload_locked_documents_rels" USING btree ("investigations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "investigations_key_findings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "investigations_chapters" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "investigations_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "investigations_updates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "investigations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "investigations_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_investigations_v_version_key_findings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_investigations_v_version_chapters" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_investigations_v_version_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_investigations_v_version_updates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_investigations_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_investigations_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "investigations_key_findings" CASCADE;
  DROP TABLE "investigations_chapters" CASCADE;
  DROP TABLE "investigations_timeline" CASCADE;
  DROP TABLE "investigations_updates" CASCADE;
  DROP TABLE "investigations" CASCADE;
  DROP TABLE "investigations_rels" CASCADE;
  DROP TABLE "_investigations_v_version_key_findings" CASCADE;
  DROP TABLE "_investigations_v_version_chapters" CASCADE;
  DROP TABLE "_investigations_v_version_timeline" CASCADE;
  DROP TABLE "_investigations_v_version_updates" CASCADE;
  DROP TABLE "_investigations_v" CASCADE;
  DROP TABLE "_investigations_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_investigations_fk";
  
  DROP INDEX "payload_locked_documents_rels_investigations_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "investigations_id";
  DROP TYPE "public"."enum_investigations_key_findings_importance";
  DROP TYPE "public"."enum_investigations_workflow_editorial_status";
  DROP TYPE "public"."enum_investigations_workflow_fact_check_status";
  DROP TYPE "public"."enum_investigations_workflow_legal_status";
  DROP TYPE "public"."enum_investigations_status";
  DROP TYPE "public"."enum__investigations_v_version_key_findings_importance";
  DROP TYPE "public"."enum__investigations_v_version_workflow_editorial_status";
  DROP TYPE "public"."enum__investigations_v_version_workflow_fact_check_status";
  DROP TYPE "public"."enum__investigations_v_version_workflow_legal_status";
  DROP TYPE "public"."enum__investigations_v_version_status";`)
}
