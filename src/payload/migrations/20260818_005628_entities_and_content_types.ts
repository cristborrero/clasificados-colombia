import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_organizations_organization_type" AS ENUM('government', 'company', 'ngo', 'political', 'international', 'media', 'other');
  CREATE TYPE "public"."enum_opinions_content_nature" AS ENUM('opinion');
  CREATE TYPE "public"."enum_opinions_workflow_editorial_status" AS ENUM('draft', 'editing', 'fact_check', 'legal_review', 'approved', 'scheduled', 'published', 'archived');
  CREATE TYPE "public"."enum_opinions_workflow_fact_check_status" AS ENUM('not_required', 'not_started', 'in_progress', 'verified', 'issues_found');
  CREATE TYPE "public"."enum_opinions_workflow_legal_status" AS ENUM('not_required', 'pending', 'approved', 'changes_required');
  CREATE TYPE "public"."enum_opinions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__opinions_v_version_content_nature" AS ENUM('opinion');
  CREATE TYPE "public"."enum__opinions_v_version_workflow_editorial_status" AS ENUM('draft', 'editing', 'fact_check', 'legal_review', 'approved', 'scheduled', 'published', 'archived');
  CREATE TYPE "public"."enum__opinions_v_version_workflow_fact_check_status" AS ENUM('not_required', 'not_started', 'in_progress', 'verified', 'issues_found');
  CREATE TYPE "public"."enum__opinions_v_version_workflow_legal_status" AS ENUM('not_required', 'pending', 'approved', 'changes_required');
  CREATE TYPE "public"."enum__opinions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_data_stories_workflow_editorial_status" AS ENUM('draft', 'editing', 'fact_check', 'legal_review', 'approved', 'scheduled', 'published', 'archived');
  CREATE TYPE "public"."enum_data_stories_workflow_fact_check_status" AS ENUM('not_required', 'not_started', 'in_progress', 'verified', 'issues_found');
  CREATE TYPE "public"."enum_data_stories_workflow_legal_status" AS ENUM('not_required', 'pending', 'approved', 'changes_required');
  CREATE TYPE "public"."enum_data_stories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__data_stories_v_version_workflow_editorial_status" AS ENUM('draft', 'editing', 'fact_check', 'legal_review', 'approved', 'scheduled', 'published', 'archived');
  CREATE TYPE "public"."enum__data_stories_v_version_workflow_fact_check_status" AS ENUM('not_required', 'not_started', 'in_progress', 'verified', 'issues_found');
  CREATE TYPE "public"."enum__data_stories_v_version_workflow_legal_status" AS ENUM('not_required', 'pending', 'approved', 'changes_required');
  CREATE TYPE "public"."enum__data_stories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_video_stories_workflow_editorial_status" AS ENUM('draft', 'editing', 'fact_check', 'legal_review', 'approved', 'scheduled', 'published', 'archived');
  CREATE TYPE "public"."enum_video_stories_workflow_fact_check_status" AS ENUM('not_required', 'not_started', 'in_progress', 'verified', 'issues_found');
  CREATE TYPE "public"."enum_video_stories_workflow_legal_status" AS ENUM('not_required', 'pending', 'approved', 'changes_required');
  CREATE TYPE "public"."enum_video_stories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__video_stories_v_version_workflow_editorial_status" AS ENUM('draft', 'editing', 'fact_check', 'legal_review', 'approved', 'scheduled', 'published', 'archived');
  CREATE TYPE "public"."enum__video_stories_v_version_workflow_fact_check_status" AS ENUM('not_required', 'not_started', 'in_progress', 'verified', 'issues_found');
  CREATE TYPE "public"."enum__video_stories_v_version_workflow_legal_status" AS ENUM('not_required', 'pending', 'approved', 'changes_required');
  CREATE TYPE "public"."enum__video_stories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_sources_source_type" AS ENUM('official_document', 'public_database', 'interview', 'press_release', 'court_record', 'law', 'academic', 'news', 'other');
  CREATE TYPE "public"."enum_sources_visibility" AS ENUM('public', 'internal');
  CREATE TABLE "people_public_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"slug_locked" boolean DEFAULT false,
  	"role_description" varchar,
  	"description" varchar,
  	"portrait_id" integer,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "people_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"organizations_id" integer
  );
  
  CREATE TABLE "organizations_public_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "organizations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"slug_locked" boolean DEFAULT false,
  	"organization_type" "enum_organizations_organization_type" DEFAULT 'other' NOT NULL,
  	"logo_id" integer,
  	"description" varchar,
  	"website" varchar,
  	"location" varchar,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "opinions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"slug_locked" boolean DEFAULT false,
  	"dek" varchar,
  	"content_nature" "enum_opinions_content_nature" DEFAULT 'opinion',
  	"author_id" integer,
  	"hero_image_id" integer,
  	"hero_caption_override" varchar,
  	"body" jsonb,
  	"created_by_id" integer,
  	"assigned_editor_id" integer,
  	"workflow_editorial_status" "enum_opinions_workflow_editorial_status" DEFAULT 'draft',
  	"workflow_fact_check_status" "enum_opinions_workflow_fact_check_status" DEFAULT 'not_started',
  	"workflow_legal_status" "enum_opinions_workflow_legal_status" DEFAULT 'not_required',
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
  	"_status" "enum_opinions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_opinions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_slug_locked" boolean DEFAULT false,
  	"version_dek" varchar,
  	"version_content_nature" "enum__opinions_v_version_content_nature" DEFAULT 'opinion',
  	"version_author_id" integer,
  	"version_hero_image_id" integer,
  	"version_hero_caption_override" varchar,
  	"version_body" jsonb,
  	"version_created_by_id" integer,
  	"version_assigned_editor_id" integer,
  	"version_workflow_editorial_status" "enum__opinions_v_version_workflow_editorial_status" DEFAULT 'draft',
  	"version_workflow_fact_check_status" "enum__opinions_v_version_workflow_fact_check_status" DEFAULT 'not_started',
  	"version_workflow_legal_status" "enum__opinions_v_version_workflow_legal_status" DEFAULT 'not_required',
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
  	"version__status" "enum__opinions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "data_stories_datasets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"source" varchar,
  	"url" varchar,
  	"license" varchar,
  	"updated_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "data_stories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"slug_locked" boolean DEFAULT false,
  	"dek" varchar,
  	"hero_image_id" integer,
  	"hero_caption_override" varchar,
  	"body" jsonb,
  	"methodology" varchar,
  	"created_by_id" integer,
  	"assigned_editor_id" integer,
  	"workflow_editorial_status" "enum_data_stories_workflow_editorial_status" DEFAULT 'draft',
  	"workflow_fact_check_status" "enum_data_stories_workflow_fact_check_status" DEFAULT 'not_started',
  	"workflow_legal_status" "enum_data_stories_workflow_legal_status" DEFAULT 'not_required',
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
  	"_status" "enum_data_stories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "data_stories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"authors_id" integer,
  	"sources_id" integer
  );
  
  CREATE TABLE "_data_stories_v_version_datasets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"source" varchar,
  	"url" varchar,
  	"license" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_data_stories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_slug_locked" boolean DEFAULT false,
  	"version_dek" varchar,
  	"version_hero_image_id" integer,
  	"version_hero_caption_override" varchar,
  	"version_body" jsonb,
  	"version_methodology" varchar,
  	"version_created_by_id" integer,
  	"version_assigned_editor_id" integer,
  	"version_workflow_editorial_status" "enum__data_stories_v_version_workflow_editorial_status" DEFAULT 'draft',
  	"version_workflow_fact_check_status" "enum__data_stories_v_version_workflow_fact_check_status" DEFAULT 'not_started',
  	"version_workflow_legal_status" "enum__data_stories_v_version_workflow_legal_status" DEFAULT 'not_required',
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
  	"version__status" "enum__data_stories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_data_stories_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"authors_id" integer,
  	"sources_id" integer
  );
  
  CREATE TABLE "video_stories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"slug_locked" boolean DEFAULT false,
  	"dek" varchar,
  	"stream_url" varchar,
  	"poster_id" integer,
  	"duration" numeric,
  	"transcript" varchar,
  	"created_by_id" integer,
  	"assigned_editor_id" integer,
  	"workflow_editorial_status" "enum_video_stories_workflow_editorial_status" DEFAULT 'draft',
  	"workflow_fact_check_status" "enum_video_stories_workflow_fact_check_status" DEFAULT 'not_started',
  	"workflow_legal_status" "enum_video_stories_workflow_legal_status" DEFAULT 'not_required',
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
  	"_status" "enum_video_stories_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "video_stories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"authors_id" integer,
  	"articles_id" integer
  );
  
  CREATE TABLE "_video_stories_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_slug_locked" boolean DEFAULT false,
  	"version_dek" varchar,
  	"version_stream_url" varchar,
  	"version_poster_id" integer,
  	"version_duration" numeric,
  	"version_transcript" varchar,
  	"version_created_by_id" integer,
  	"version_assigned_editor_id" integer,
  	"version_workflow_editorial_status" "enum__video_stories_v_version_workflow_editorial_status" DEFAULT 'draft',
  	"version_workflow_fact_check_status" "enum__video_stories_v_version_workflow_fact_check_status" DEFAULT 'not_started',
  	"version_workflow_legal_status" "enum__video_stories_v_version_workflow_legal_status" DEFAULT 'not_required',
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
  	"version__status" "enum__video_stories_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_video_stories_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"authors_id" integer,
  	"articles_id" integer
  );
  
  CREATE TABLE "sources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"source_type" "enum_sources_source_type" DEFAULT 'official_document' NOT NULL,
  	"visibility" "enum_sources_visibility" DEFAULT 'internal' NOT NULL,
  	"publisher" varchar,
  	"url" varchar,
  	"archive_url" varchar,
  	"published_at" timestamp(3) with time zone,
  	"accessed_at" timestamp(3) with time zone,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "authors" ADD COLUMN "portrait_id" integer;
  ALTER TABLE "topics" ADD COLUMN "image_id" integer;
  ALTER TABLE "articles" ADD COLUMN "created_by_id" integer;
  ALTER TABLE "articles" ADD COLUMN "assigned_editor_id" integer;
  ALTER TABLE "articles_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "articles_rels" ADD COLUMN "organizations_id" integer;
  ALTER TABLE "articles_rels" ADD COLUMN "sources_id" integer;
  ALTER TABLE "_articles_v" ADD COLUMN "version_created_by_id" integer;
  ALTER TABLE "_articles_v" ADD COLUMN "version_assigned_editor_id" integer;
  ALTER TABLE "_articles_v_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "_articles_v_rels" ADD COLUMN "organizations_id" integer;
  ALTER TABLE "_articles_v_rels" ADD COLUMN "sources_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "people_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "organizations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "opinions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "data_stories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "video_stories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sources_id" integer;
  ALTER TABLE "people_public_sources" ADD CONSTRAINT "people_public_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people_rels" ADD CONSTRAINT "people_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people_rels" ADD CONSTRAINT "people_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organizations_public_sources" ADD CONSTRAINT "organizations_public_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organizations" ADD CONSTRAINT "organizations_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "opinions" ADD CONSTRAINT "opinions_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "opinions" ADD CONSTRAINT "opinions_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "opinions" ADD CONSTRAINT "opinions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "opinions" ADD CONSTRAINT "opinions_assigned_editor_id_users_id_fk" FOREIGN KEY ("assigned_editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opinions_v" ADD CONSTRAINT "_opinions_v_parent_id_opinions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."opinions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opinions_v" ADD CONSTRAINT "_opinions_v_version_author_id_authors_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opinions_v" ADD CONSTRAINT "_opinions_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opinions_v" ADD CONSTRAINT "_opinions_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_opinions_v" ADD CONSTRAINT "_opinions_v_version_assigned_editor_id_users_id_fk" FOREIGN KEY ("version_assigned_editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "data_stories_datasets" ADD CONSTRAINT "data_stories_datasets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."data_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "data_stories" ADD CONSTRAINT "data_stories_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "data_stories" ADD CONSTRAINT "data_stories_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "data_stories" ADD CONSTRAINT "data_stories_assigned_editor_id_users_id_fk" FOREIGN KEY ("assigned_editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "data_stories_rels" ADD CONSTRAINT "data_stories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."data_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "data_stories_rels" ADD CONSTRAINT "data_stories_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "data_stories_rels" ADD CONSTRAINT "data_stories_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_data_stories_v_version_datasets" ADD CONSTRAINT "_data_stories_v_version_datasets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_data_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_data_stories_v" ADD CONSTRAINT "_data_stories_v_parent_id_data_stories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."data_stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_data_stories_v" ADD CONSTRAINT "_data_stories_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_data_stories_v" ADD CONSTRAINT "_data_stories_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_data_stories_v" ADD CONSTRAINT "_data_stories_v_version_assigned_editor_id_users_id_fk" FOREIGN KEY ("version_assigned_editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_data_stories_v_rels" ADD CONSTRAINT "_data_stories_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_data_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_data_stories_v_rels" ADD CONSTRAINT "_data_stories_v_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_data_stories_v_rels" ADD CONSTRAINT "_data_stories_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "video_stories" ADD CONSTRAINT "video_stories_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "video_stories" ADD CONSTRAINT "video_stories_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "video_stories" ADD CONSTRAINT "video_stories_assigned_editor_id_users_id_fk" FOREIGN KEY ("assigned_editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "video_stories_rels" ADD CONSTRAINT "video_stories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."video_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "video_stories_rels" ADD CONSTRAINT "video_stories_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "video_stories_rels" ADD CONSTRAINT "video_stories_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_video_stories_v" ADD CONSTRAINT "_video_stories_v_parent_id_video_stories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."video_stories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_video_stories_v" ADD CONSTRAINT "_video_stories_v_version_poster_id_media_id_fk" FOREIGN KEY ("version_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_video_stories_v" ADD CONSTRAINT "_video_stories_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_video_stories_v" ADD CONSTRAINT "_video_stories_v_version_assigned_editor_id_users_id_fk" FOREIGN KEY ("version_assigned_editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_video_stories_v_rels" ADD CONSTRAINT "_video_stories_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_video_stories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_video_stories_v_rels" ADD CONSTRAINT "_video_stories_v_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_video_stories_v_rels" ADD CONSTRAINT "_video_stories_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "people_public_sources_order_idx" ON "people_public_sources" USING btree ("_order");
  CREATE INDEX "people_public_sources_parent_id_idx" ON "people_public_sources" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "people_slug_idx" ON "people" USING btree ("slug");
  CREATE INDEX "people_portrait_idx" ON "people" USING btree ("portrait_id");
  CREATE INDEX "people_active_idx" ON "people" USING btree ("active");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE INDEX "people_rels_order_idx" ON "people_rels" USING btree ("order");
  CREATE INDEX "people_rels_parent_idx" ON "people_rels" USING btree ("parent_id");
  CREATE INDEX "people_rels_path_idx" ON "people_rels" USING btree ("path");
  CREATE INDEX "people_rels_organizations_id_idx" ON "people_rels" USING btree ("organizations_id");
  CREATE INDEX "organizations_public_sources_order_idx" ON "organizations_public_sources" USING btree ("_order");
  CREATE INDEX "organizations_public_sources_parent_id_idx" ON "organizations_public_sources" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");
  CREATE INDEX "organizations_organization_type_idx" ON "organizations" USING btree ("organization_type");
  CREATE INDEX "organizations_logo_idx" ON "organizations" USING btree ("logo_id");
  CREATE INDEX "organizations_active_idx" ON "organizations" USING btree ("active");
  CREATE INDEX "organizations_updated_at_idx" ON "organizations" USING btree ("updated_at");
  CREATE INDEX "organizations_created_at_idx" ON "organizations" USING btree ("created_at");
  CREATE UNIQUE INDEX "opinions_slug_idx" ON "opinions" USING btree ("slug");
  CREATE INDEX "opinions_author_idx" ON "opinions" USING btree ("author_id");
  CREATE INDEX "opinions_hero_hero_image_idx" ON "opinions" USING btree ("hero_image_id");
  CREATE INDEX "opinions_created_by_idx" ON "opinions" USING btree ("created_by_id");
  CREATE INDEX "opinions_assigned_editor_idx" ON "opinions" USING btree ("assigned_editor_id");
  CREATE INDEX "opinions_workflow_workflow_editorial_status_idx" ON "opinions" USING btree ("workflow_editorial_status");
  CREATE INDEX "opinions_publication_publication_published_at_idx" ON "opinions" USING btree ("publication_published_at");
  CREATE INDEX "opinions_updated_at_idx" ON "opinions" USING btree ("updated_at");
  CREATE INDEX "opinions_created_at_idx" ON "opinions" USING btree ("created_at");
  CREATE INDEX "opinions__status_idx" ON "opinions" USING btree ("_status");
  CREATE INDEX "_opinions_v_parent_idx" ON "_opinions_v" USING btree ("parent_id");
  CREATE INDEX "_opinions_v_version_version_slug_idx" ON "_opinions_v" USING btree ("version_slug");
  CREATE INDEX "_opinions_v_version_version_author_idx" ON "_opinions_v" USING btree ("version_author_id");
  CREATE INDEX "_opinions_v_version_hero_version_hero_image_idx" ON "_opinions_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_opinions_v_version_version_created_by_idx" ON "_opinions_v" USING btree ("version_created_by_id");
  CREATE INDEX "_opinions_v_version_version_assigned_editor_idx" ON "_opinions_v" USING btree ("version_assigned_editor_id");
  CREATE INDEX "_opinions_v_version_workflow_version_workflow_editorial__idx" ON "_opinions_v" USING btree ("version_workflow_editorial_status");
  CREATE INDEX "_opinions_v_version_publication_version_publication_publ_idx" ON "_opinions_v" USING btree ("version_publication_published_at");
  CREATE INDEX "_opinions_v_version_version_updated_at_idx" ON "_opinions_v" USING btree ("version_updated_at");
  CREATE INDEX "_opinions_v_version_version_created_at_idx" ON "_opinions_v" USING btree ("version_created_at");
  CREATE INDEX "_opinions_v_version_version__status_idx" ON "_opinions_v" USING btree ("version__status");
  CREATE INDEX "_opinions_v_created_at_idx" ON "_opinions_v" USING btree ("created_at");
  CREATE INDEX "_opinions_v_updated_at_idx" ON "_opinions_v" USING btree ("updated_at");
  CREATE INDEX "_opinions_v_latest_idx" ON "_opinions_v" USING btree ("latest");
  CREATE INDEX "data_stories_datasets_order_idx" ON "data_stories_datasets" USING btree ("_order");
  CREATE INDEX "data_stories_datasets_parent_id_idx" ON "data_stories_datasets" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "data_stories_slug_idx" ON "data_stories" USING btree ("slug");
  CREATE INDEX "data_stories_hero_hero_image_idx" ON "data_stories" USING btree ("hero_image_id");
  CREATE INDEX "data_stories_created_by_idx" ON "data_stories" USING btree ("created_by_id");
  CREATE INDEX "data_stories_assigned_editor_idx" ON "data_stories" USING btree ("assigned_editor_id");
  CREATE INDEX "data_stories_workflow_workflow_editorial_status_idx" ON "data_stories" USING btree ("workflow_editorial_status");
  CREATE INDEX "data_stories_publication_publication_published_at_idx" ON "data_stories" USING btree ("publication_published_at");
  CREATE INDEX "data_stories_updated_at_idx" ON "data_stories" USING btree ("updated_at");
  CREATE INDEX "data_stories_created_at_idx" ON "data_stories" USING btree ("created_at");
  CREATE INDEX "data_stories__status_idx" ON "data_stories" USING btree ("_status");
  CREATE INDEX "data_stories_rels_order_idx" ON "data_stories_rels" USING btree ("order");
  CREATE INDEX "data_stories_rels_parent_idx" ON "data_stories_rels" USING btree ("parent_id");
  CREATE INDEX "data_stories_rels_path_idx" ON "data_stories_rels" USING btree ("path");
  CREATE INDEX "data_stories_rels_authors_id_idx" ON "data_stories_rels" USING btree ("authors_id");
  CREATE INDEX "data_stories_rels_sources_id_idx" ON "data_stories_rels" USING btree ("sources_id");
  CREATE INDEX "_data_stories_v_version_datasets_order_idx" ON "_data_stories_v_version_datasets" USING btree ("_order");
  CREATE INDEX "_data_stories_v_version_datasets_parent_id_idx" ON "_data_stories_v_version_datasets" USING btree ("_parent_id");
  CREATE INDEX "_data_stories_v_parent_idx" ON "_data_stories_v" USING btree ("parent_id");
  CREATE INDEX "_data_stories_v_version_version_slug_idx" ON "_data_stories_v" USING btree ("version_slug");
  CREATE INDEX "_data_stories_v_version_hero_version_hero_image_idx" ON "_data_stories_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_data_stories_v_version_version_created_by_idx" ON "_data_stories_v" USING btree ("version_created_by_id");
  CREATE INDEX "_data_stories_v_version_version_assigned_editor_idx" ON "_data_stories_v" USING btree ("version_assigned_editor_id");
  CREATE INDEX "_data_stories_v_version_workflow_version_workflow_editor_idx" ON "_data_stories_v" USING btree ("version_workflow_editorial_status");
  CREATE INDEX "_data_stories_v_version_publication_version_publication__idx" ON "_data_stories_v" USING btree ("version_publication_published_at");
  CREATE INDEX "_data_stories_v_version_version_updated_at_idx" ON "_data_stories_v" USING btree ("version_updated_at");
  CREATE INDEX "_data_stories_v_version_version_created_at_idx" ON "_data_stories_v" USING btree ("version_created_at");
  CREATE INDEX "_data_stories_v_version_version__status_idx" ON "_data_stories_v" USING btree ("version__status");
  CREATE INDEX "_data_stories_v_created_at_idx" ON "_data_stories_v" USING btree ("created_at");
  CREATE INDEX "_data_stories_v_updated_at_idx" ON "_data_stories_v" USING btree ("updated_at");
  CREATE INDEX "_data_stories_v_latest_idx" ON "_data_stories_v" USING btree ("latest");
  CREATE INDEX "_data_stories_v_rels_order_idx" ON "_data_stories_v_rels" USING btree ("order");
  CREATE INDEX "_data_stories_v_rels_parent_idx" ON "_data_stories_v_rels" USING btree ("parent_id");
  CREATE INDEX "_data_stories_v_rels_path_idx" ON "_data_stories_v_rels" USING btree ("path");
  CREATE INDEX "_data_stories_v_rels_authors_id_idx" ON "_data_stories_v_rels" USING btree ("authors_id");
  CREATE INDEX "_data_stories_v_rels_sources_id_idx" ON "_data_stories_v_rels" USING btree ("sources_id");
  CREATE UNIQUE INDEX "video_stories_slug_idx" ON "video_stories" USING btree ("slug");
  CREATE INDEX "video_stories_poster_idx" ON "video_stories" USING btree ("poster_id");
  CREATE INDEX "video_stories_created_by_idx" ON "video_stories" USING btree ("created_by_id");
  CREATE INDEX "video_stories_assigned_editor_idx" ON "video_stories" USING btree ("assigned_editor_id");
  CREATE INDEX "video_stories_workflow_workflow_editorial_status_idx" ON "video_stories" USING btree ("workflow_editorial_status");
  CREATE INDEX "video_stories_publication_publication_published_at_idx" ON "video_stories" USING btree ("publication_published_at");
  CREATE INDEX "video_stories_updated_at_idx" ON "video_stories" USING btree ("updated_at");
  CREATE INDEX "video_stories_created_at_idx" ON "video_stories" USING btree ("created_at");
  CREATE INDEX "video_stories__status_idx" ON "video_stories" USING btree ("_status");
  CREATE INDEX "video_stories_rels_order_idx" ON "video_stories_rels" USING btree ("order");
  CREATE INDEX "video_stories_rels_parent_idx" ON "video_stories_rels" USING btree ("parent_id");
  CREATE INDEX "video_stories_rels_path_idx" ON "video_stories_rels" USING btree ("path");
  CREATE INDEX "video_stories_rels_authors_id_idx" ON "video_stories_rels" USING btree ("authors_id");
  CREATE INDEX "video_stories_rels_articles_id_idx" ON "video_stories_rels" USING btree ("articles_id");
  CREATE INDEX "_video_stories_v_parent_idx" ON "_video_stories_v" USING btree ("parent_id");
  CREATE INDEX "_video_stories_v_version_version_slug_idx" ON "_video_stories_v" USING btree ("version_slug");
  CREATE INDEX "_video_stories_v_version_version_poster_idx" ON "_video_stories_v" USING btree ("version_poster_id");
  CREATE INDEX "_video_stories_v_version_version_created_by_idx" ON "_video_stories_v" USING btree ("version_created_by_id");
  CREATE INDEX "_video_stories_v_version_version_assigned_editor_idx" ON "_video_stories_v" USING btree ("version_assigned_editor_id");
  CREATE INDEX "_video_stories_v_version_workflow_version_workflow_edito_idx" ON "_video_stories_v" USING btree ("version_workflow_editorial_status");
  CREATE INDEX "_video_stories_v_version_publication_version_publication_idx" ON "_video_stories_v" USING btree ("version_publication_published_at");
  CREATE INDEX "_video_stories_v_version_version_updated_at_idx" ON "_video_stories_v" USING btree ("version_updated_at");
  CREATE INDEX "_video_stories_v_version_version_created_at_idx" ON "_video_stories_v" USING btree ("version_created_at");
  CREATE INDEX "_video_stories_v_version_version__status_idx" ON "_video_stories_v" USING btree ("version__status");
  CREATE INDEX "_video_stories_v_created_at_idx" ON "_video_stories_v" USING btree ("created_at");
  CREATE INDEX "_video_stories_v_updated_at_idx" ON "_video_stories_v" USING btree ("updated_at");
  CREATE INDEX "_video_stories_v_latest_idx" ON "_video_stories_v" USING btree ("latest");
  CREATE INDEX "_video_stories_v_rels_order_idx" ON "_video_stories_v_rels" USING btree ("order");
  CREATE INDEX "_video_stories_v_rels_parent_idx" ON "_video_stories_v_rels" USING btree ("parent_id");
  CREATE INDEX "_video_stories_v_rels_path_idx" ON "_video_stories_v_rels" USING btree ("path");
  CREATE INDEX "_video_stories_v_rels_authors_id_idx" ON "_video_stories_v_rels" USING btree ("authors_id");
  CREATE INDEX "_video_stories_v_rels_articles_id_idx" ON "_video_stories_v_rels" USING btree ("articles_id");
  CREATE INDEX "sources_source_type_idx" ON "sources" USING btree ("source_type");
  CREATE INDEX "sources_visibility_idx" ON "sources" USING btree ("visibility");
  CREATE INDEX "sources_updated_at_idx" ON "sources" USING btree ("updated_at");
  CREATE INDEX "sources_created_at_idx" ON "sources" USING btree ("created_at");
  ALTER TABLE "authors" ADD CONSTRAINT "authors_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics" ADD CONSTRAINT "topics_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_assigned_editor_id_users_id_fk" FOREIGN KEY ("assigned_editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_assigned_editor_id_users_id_fk" FOREIGN KEY ("version_assigned_editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_opinions_fk" FOREIGN KEY ("opinions_id") REFERENCES "public"."opinions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_data_stories_fk" FOREIGN KEY ("data_stories_id") REFERENCES "public"."data_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_video_stories_fk" FOREIGN KEY ("video_stories_id") REFERENCES "public"."video_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "authors_portrait_idx" ON "authors" USING btree ("portrait_id");
  CREATE INDEX "topics_image_idx" ON "topics" USING btree ("image_id");
  CREATE INDEX "articles_created_by_idx" ON "articles" USING btree ("created_by_id");
  CREATE INDEX "articles_assigned_editor_idx" ON "articles" USING btree ("assigned_editor_id");
  CREATE INDEX "articles_rels_people_id_idx" ON "articles_rels" USING btree ("people_id");
  CREATE INDEX "articles_rels_organizations_id_idx" ON "articles_rels" USING btree ("organizations_id");
  CREATE INDEX "articles_rels_sources_id_idx" ON "articles_rels" USING btree ("sources_id");
  CREATE INDEX "_articles_v_version_version_created_by_idx" ON "_articles_v" USING btree ("version_created_by_id");
  CREATE INDEX "_articles_v_version_version_assigned_editor_idx" ON "_articles_v" USING btree ("version_assigned_editor_id");
  CREATE INDEX "_articles_v_rels_people_id_idx" ON "_articles_v_rels" USING btree ("people_id");
  CREATE INDEX "_articles_v_rels_organizations_id_idx" ON "_articles_v_rels" USING btree ("organizations_id");
  CREATE INDEX "_articles_v_rels_sources_id_idx" ON "_articles_v_rels" USING btree ("sources_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_organizations_id_idx" ON "payload_locked_documents_rels" USING btree ("organizations_id");
  CREATE INDEX "payload_locked_documents_rels_opinions_id_idx" ON "payload_locked_documents_rels" USING btree ("opinions_id");
  CREATE INDEX "payload_locked_documents_rels_data_stories_id_idx" ON "payload_locked_documents_rels" USING btree ("data_stories_id");
  CREATE INDEX "payload_locked_documents_rels_video_stories_id_idx" ON "payload_locked_documents_rels" USING btree ("video_stories_id");
  CREATE INDEX "payload_locked_documents_rels_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("sources_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "people_public_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "people_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "organizations_public_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "organizations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "opinions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_opinions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "data_stories_datasets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "data_stories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "data_stories_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_data_stories_v_version_datasets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_data_stories_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_data_stories_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "video_stories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "video_stories_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_video_stories_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_video_stories_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sources" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "people_public_sources" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "people_rels" CASCADE;
  DROP TABLE "organizations_public_sources" CASCADE;
  DROP TABLE "organizations" CASCADE;
  DROP TABLE "opinions" CASCADE;
  DROP TABLE "_opinions_v" CASCADE;
  DROP TABLE "data_stories_datasets" CASCADE;
  DROP TABLE "data_stories" CASCADE;
  DROP TABLE "data_stories_rels" CASCADE;
  DROP TABLE "_data_stories_v_version_datasets" CASCADE;
  DROP TABLE "_data_stories_v" CASCADE;
  DROP TABLE "_data_stories_v_rels" CASCADE;
  DROP TABLE "video_stories" CASCADE;
  DROP TABLE "video_stories_rels" CASCADE;
  DROP TABLE "_video_stories_v" CASCADE;
  DROP TABLE "_video_stories_v_rels" CASCADE;
  DROP TABLE "sources" CASCADE;
  ALTER TABLE "authors" DROP CONSTRAINT "authors_portrait_id_media_id_fk";
  
  ALTER TABLE "topics" DROP CONSTRAINT "topics_image_id_media_id_fk";
  
  ALTER TABLE "articles" DROP CONSTRAINT "articles_created_by_id_users_id_fk";
  
  ALTER TABLE "articles" DROP CONSTRAINT "articles_assigned_editor_id_users_id_fk";
  
  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_people_fk";
  
  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_organizations_fk";
  
  ALTER TABLE "articles_rels" DROP CONSTRAINT "articles_rels_sources_fk";
  
  ALTER TABLE "_articles_v" DROP CONSTRAINT "_articles_v_version_created_by_id_users_id_fk";
  
  ALTER TABLE "_articles_v" DROP CONSTRAINT "_articles_v_version_assigned_editor_id_users_id_fk";
  
  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_people_fk";
  
  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_organizations_fk";
  
  ALTER TABLE "_articles_v_rels" DROP CONSTRAINT "_articles_v_rels_sources_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_people_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_organizations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_opinions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_data_stories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_video_stories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sources_fk";
  
  DROP INDEX "authors_portrait_idx";
  DROP INDEX "topics_image_idx";
  DROP INDEX "articles_created_by_idx";
  DROP INDEX "articles_assigned_editor_idx";
  DROP INDEX "articles_rels_people_id_idx";
  DROP INDEX "articles_rels_organizations_id_idx";
  DROP INDEX "articles_rels_sources_id_idx";
  DROP INDEX "_articles_v_version_version_created_by_idx";
  DROP INDEX "_articles_v_version_version_assigned_editor_idx";
  DROP INDEX "_articles_v_rels_people_id_idx";
  DROP INDEX "_articles_v_rels_organizations_id_idx";
  DROP INDEX "_articles_v_rels_sources_id_idx";
  DROP INDEX "payload_locked_documents_rels_people_id_idx";
  DROP INDEX "payload_locked_documents_rels_organizations_id_idx";
  DROP INDEX "payload_locked_documents_rels_opinions_id_idx";
  DROP INDEX "payload_locked_documents_rels_data_stories_id_idx";
  DROP INDEX "payload_locked_documents_rels_video_stories_id_idx";
  DROP INDEX "payload_locked_documents_rels_sources_id_idx";
  ALTER TABLE "authors" DROP COLUMN "portrait_id";
  ALTER TABLE "topics" DROP COLUMN "image_id";
  ALTER TABLE "articles" DROP COLUMN "created_by_id";
  ALTER TABLE "articles" DROP COLUMN "assigned_editor_id";
  ALTER TABLE "articles_rels" DROP COLUMN "people_id";
  ALTER TABLE "articles_rels" DROP COLUMN "organizations_id";
  ALTER TABLE "articles_rels" DROP COLUMN "sources_id";
  ALTER TABLE "_articles_v" DROP COLUMN "version_created_by_id";
  ALTER TABLE "_articles_v" DROP COLUMN "version_assigned_editor_id";
  ALTER TABLE "_articles_v_rels" DROP COLUMN "people_id";
  ALTER TABLE "_articles_v_rels" DROP COLUMN "organizations_id";
  ALTER TABLE "_articles_v_rels" DROP COLUMN "sources_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "people_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "organizations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "opinions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "data_stories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "video_stories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sources_id";
  DROP TYPE "public"."enum_organizations_organization_type";
  DROP TYPE "public"."enum_opinions_content_nature";
  DROP TYPE "public"."enum_opinions_workflow_editorial_status";
  DROP TYPE "public"."enum_opinions_workflow_fact_check_status";
  DROP TYPE "public"."enum_opinions_workflow_legal_status";
  DROP TYPE "public"."enum_opinions_status";
  DROP TYPE "public"."enum__opinions_v_version_content_nature";
  DROP TYPE "public"."enum__opinions_v_version_workflow_editorial_status";
  DROP TYPE "public"."enum__opinions_v_version_workflow_fact_check_status";
  DROP TYPE "public"."enum__opinions_v_version_workflow_legal_status";
  DROP TYPE "public"."enum__opinions_v_version_status";
  DROP TYPE "public"."enum_data_stories_workflow_editorial_status";
  DROP TYPE "public"."enum_data_stories_workflow_fact_check_status";
  DROP TYPE "public"."enum_data_stories_workflow_legal_status";
  DROP TYPE "public"."enum_data_stories_status";
  DROP TYPE "public"."enum__data_stories_v_version_workflow_editorial_status";
  DROP TYPE "public"."enum__data_stories_v_version_workflow_fact_check_status";
  DROP TYPE "public"."enum__data_stories_v_version_workflow_legal_status";
  DROP TYPE "public"."enum__data_stories_v_version_status";
  DROP TYPE "public"."enum_video_stories_workflow_editorial_status";
  DROP TYPE "public"."enum_video_stories_workflow_fact_check_status";
  DROP TYPE "public"."enum_video_stories_workflow_legal_status";
  DROP TYPE "public"."enum_video_stories_status";
  DROP TYPE "public"."enum__video_stories_v_version_workflow_editorial_status";
  DROP TYPE "public"."enum__video_stories_v_version_workflow_fact_check_status";
  DROP TYPE "public"."enum__video_stories_v_version_workflow_legal_status";
  DROP TYPE "public"."enum__video_stories_v_version_status";
  DROP TYPE "public"."enum_sources_source_type";
  DROP TYPE "public"."enum_sources_visibility";`)
}
