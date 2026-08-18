import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'author');
  CREATE TYPE "public"."enum_users_status" AS ENUM('active', 'suspended', 'disabled');
  CREATE TYPE "public"."enum_organizations_organization_type" AS ENUM('government', 'company', 'ngo', 'political', 'international', 'media', 'other');
  CREATE TYPE "public"."enum_media_media_type" AS ENUM('photo', 'illustration', 'graphic', 'logo', 'screenshot', 'document_preview', 'video_poster', 'other');
  CREATE TYPE "public"."enum_media_license" AS ENUM('owned', 'licensed', 'creative_commons', 'public_domain', 'courtesy', 'editorial_use', 'unknown');
  CREATE TYPE "public"."enum_media_synthetic_media" AS ENUM('none', 'ai_generated', 'ai_modified', 'composite', 'illustration');
  CREATE TYPE "public"."enum_articles_content_type" AS ENUM('news', 'reportage', 'analysis', 'explainer', 'interview', 'profile', 'chronicle');
  CREATE TYPE "public"."enum_articles_workflow_editorial_status" AS ENUM('draft', 'editing', 'fact_check', 'legal_review', 'approved', 'scheduled', 'published', 'archived');
  CREATE TYPE "public"."enum_articles_workflow_fact_check_status" AS ENUM('not_required', 'not_started', 'in_progress', 'verified', 'issues_found');
  CREATE TYPE "public"."enum_articles_workflow_legal_status" AS ENUM('not_required', 'pending', 'approved', 'changes_required');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_content_type" AS ENUM('news', 'reportage', 'analysis', 'explainer', 'interview', 'profile', 'chronicle');
  CREATE TYPE "public"."enum__articles_v_version_workflow_editorial_status" AS ENUM('draft', 'editing', 'fact_check', 'legal_review', 'approved', 'scheduled', 'published', 'archived');
  CREATE TYPE "public"."enum__articles_v_version_workflow_fact_check_status" AS ENUM('not_required', 'not_started', 'in_progress', 'verified', 'issues_found');
  CREATE TYPE "public"."enum__articles_v_version_workflow_legal_status" AS ENUM('not_required', 'pending', 'approved', 'changes_required');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
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
  CREATE TYPE "public"."enum_redirects_status_code" AS ENUM('301', '308', '302', '307');
  CREATE TYPE "public"."enum_audit_events_action" AS ENUM('login_success', 'login_failure', 'user_created', 'user_disabled', 'role_changed', 'content_published', 'content_unpublished', 'content_deleted', 'settings_changed');
  CREATE TYPE "public"."enum_audit_events_result" AS ENUM('allowed', 'denied');
  CREATE TYPE "public"."enum_tips_status" AS ENUM('new', 'reviewing', 'archived', 'escalated');
  CREATE TYPE "public"."enum_navigation_primary_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_navigation_secondary_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_navigation_footer_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_breaking_news_severity" AS ENUM('breaking', 'alert', 'developing', 'confirmed');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'author' NOT NULL,
  	"status" "enum_users_status" DEFAULT 'active' NOT NULL,
  	"department" varchar,
  	"mfa_enabled" boolean DEFAULT false,
  	"last_login_at" timestamp(3) with time zone,
  	"password_changed_at" timestamp(3) with time zone,
  	"security_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
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
  	"portrait_id" integer,
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
  	"parent_id" integer,
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
  	"image_id" integer,
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
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"decorative" boolean DEFAULT false,
  	"caption" varchar,
  	"credit" varchar,
  	"photographer" varchar,
  	"source" varchar,
  	"media_type" "enum_media_media_type" DEFAULT 'photo',
  	"license" "enum_media_license" DEFAULT 'unknown',
  	"copyright_holder" varchar,
  	"rights_expiration" timestamp(3) with time zone,
  	"synthetic_media" "enum_media_synthetic_media" DEFAULT 'none',
  	"usage_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_article_url" varchar,
  	"sizes_article_width" numeric,
  	"sizes_article_height" numeric,
  	"sizes_article_mime_type" varchar,
  	"sizes_article_filesize" numeric,
  	"sizes_article_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"slug_locked" boolean DEFAULT false,
  	"dek" varchar,
  	"content_type" "enum_articles_content_type" DEFAULT 'news',
  	"category_id" integer,
  	"hero_image_id" integer,
  	"hero_caption_override" varchar,
  	"body" jsonb,
  	"created_by_id" integer,
  	"assigned_editor_id" integer,
  	"workflow_editorial_status" "enum_articles_workflow_editorial_status" DEFAULT 'draft',
  	"workflow_fact_check_status" "enum_articles_workflow_fact_check_status" DEFAULT 'not_started',
  	"workflow_legal_status" "enum_articles_workflow_legal_status" DEFAULT 'not_required',
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
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"topics_id" integer,
  	"authors_id" integer,
  	"articles_id" integer,
  	"people_id" integer,
  	"organizations_id" integer,
  	"sources_id" integer
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_slug_locked" boolean DEFAULT false,
  	"version_dek" varchar,
  	"version_content_type" "enum__articles_v_version_content_type" DEFAULT 'news',
  	"version_category_id" integer,
  	"version_hero_image_id" integer,
  	"version_hero_caption_override" varchar,
  	"version_body" jsonb,
  	"version_created_by_id" integer,
  	"version_assigned_editor_id" integer,
  	"version_workflow_editorial_status" "enum__articles_v_version_workflow_editorial_status" DEFAULT 'draft',
  	"version_workflow_fact_check_status" "enum__articles_v_version_workflow_fact_check_status" DEFAULT 'not_started',
  	"version_workflow_legal_status" "enum__articles_v_version_workflow_legal_status" DEFAULT 'not_required',
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
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_articles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"topics_id" integer,
  	"authors_id" integer,
  	"articles_id" integer,
  	"people_id" integer,
  	"organizations_id" integer,
  	"sources_id" integer
  );
  
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
  	"topics_id" integer,
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
  	"topics_id" integer,
  	"people_id" integer,
  	"organizations_id" integer
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
  	"headline_figure" varchar,
  	"headline_figure_context" varchar,
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
  	"version_headline_figure" varchar,
  	"version_headline_figure_context" varchar,
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
  
  CREATE TABLE "evidence_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"document_type" varchar,
  	"institution" varchar,
  	"document_date" timestamp(3) with time zone,
  	"page_count" numeric,
  	"related_investigation_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"status_code" "enum_redirects_status_code" DEFAULT '308' NOT NULL,
  	"reason" varchar,
  	"active" boolean DEFAULT true,
  	"automatic" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audit_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"timestamp" timestamp(3) with time zone NOT NULL,
  	"action" "enum_audit_events_action" NOT NULL,
  	"actor_id" varchar,
  	"actor_role" varchar,
  	"resource_type" varchar,
  	"resource_id" varchar,
  	"result" "enum_audit_events_result" DEFAULT 'allowed' NOT NULL,
  	"request_id" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tips_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer NOT NULL
  );
  
  CREATE TABLE "tips" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"location" varchar,
  	"anonymous" boolean DEFAULT false,
  	"contact_name" varchar,
  	"contact_email" varchar,
  	"contact_phone" varchar,
  	"status" "enum_tips_status" DEFAULT 'new' NOT NULL,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"authors_id" integer,
  	"categories_id" integer,
  	"topics_id" integer,
  	"people_id" integer,
  	"organizations_id" integer,
  	"media_id" integer,
  	"articles_id" integer,
  	"investigations_id" integer,
  	"opinions_id" integer,
  	"data_stories_id" integer,
  	"video_stories_id" integer,
  	"sources_id" integer,
  	"evidence_documents_id" integer,
  	"redirects_id" integer,
  	"audit_events_id" integer,
  	"tips_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
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
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors_expertise" ADD CONSTRAINT "authors_expertise_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors_social_links" ADD CONSTRAINT "authors_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics" ADD CONSTRAINT "topics_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "topics_rels" ADD CONSTRAINT "topics_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people_public_sources" ADD CONSTRAINT "people_public_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people_rels" ADD CONSTRAINT "people_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people_rels" ADD CONSTRAINT "people_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organizations_public_sources" ADD CONSTRAINT "organizations_public_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organizations" ADD CONSTRAINT "organizations_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_assigned_editor_id_users_id_fk" FOREIGN KEY ("assigned_editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_assigned_editor_id_users_id_fk" FOREIGN KEY ("version_assigned_editor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "investigations_rels" ADD CONSTRAINT "investigations_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "_investigations_v_rels" ADD CONSTRAINT "_investigations_v_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_investigations_v_rels" ADD CONSTRAINT "_investigations_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_investigations_v_rels" ADD CONSTRAINT "_investigations_v_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "evidence_documents" ADD CONSTRAINT "evidence_documents_related_investigation_id_investigations_id_fk" FOREIGN KEY ("related_investigation_id") REFERENCES "public"."investigations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tips_attachments" ADD CONSTRAINT "tips_attachments_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tips_attachments" ADD CONSTRAINT "tips_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_topics_fk" FOREIGN KEY ("topics_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_investigations_fk" FOREIGN KEY ("investigations_id") REFERENCES "public"."investigations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_opinions_fk" FOREIGN KEY ("opinions_id") REFERENCES "public"."opinions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_data_stories_fk" FOREIGN KEY ("data_stories_id") REFERENCES "public"."data_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_video_stories_fk" FOREIGN KEY ("video_stories_id") REFERENCES "public"."video_stories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_evidence_documents_fk" FOREIGN KEY ("evidence_documents_id") REFERENCES "public"."evidence_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_events_fk" FOREIGN KEY ("audit_events_id") REFERENCES "public"."audit_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tips_fk" FOREIGN KEY ("tips_id") REFERENCES "public"."tips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "breaking_news" ADD CONSTRAINT "breaking_news_related_article_id_articles_id_fk" FOREIGN KEY ("related_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_role_idx" ON "users" USING btree ("role");
  CREATE INDEX "users_status_idx" ON "users" USING btree ("status");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "authors_expertise_order_idx" ON "authors_expertise" USING btree ("_order");
  CREATE INDEX "authors_expertise_parent_id_idx" ON "authors_expertise" USING btree ("_parent_id");
  CREATE INDEX "authors_social_links_order_idx" ON "authors_social_links" USING btree ("_order");
  CREATE INDEX "authors_social_links_parent_id_idx" ON "authors_social_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "authors_slug_idx" ON "authors" USING btree ("slug");
  CREATE INDEX "authors_active_idx" ON "authors" USING btree ("active");
  CREATE INDEX "authors_portrait_idx" ON "authors" USING btree ("portrait_id");
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_active_idx" ON "categories" USING btree ("active");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "topics_slug_idx" ON "topics" USING btree ("slug");
  CREATE INDEX "topics_image_idx" ON "topics" USING btree ("image_id");
  CREATE INDEX "topics_active_idx" ON "topics" USING btree ("active");
  CREATE INDEX "topics_updated_at_idx" ON "topics" USING btree ("updated_at");
  CREATE INDEX "topics_created_at_idx" ON "topics" USING btree ("created_at");
  CREATE INDEX "topics_rels_order_idx" ON "topics_rels" USING btree ("order");
  CREATE INDEX "topics_rels_parent_idx" ON "topics_rels" USING btree ("parent_id");
  CREATE INDEX "topics_rels_path_idx" ON "topics_rels" USING btree ("path");
  CREATE INDEX "topics_rels_topics_id_idx" ON "topics_rels" USING btree ("topics_id");
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
  CREATE INDEX "media_license_idx" ON "media" USING btree ("license");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_article_sizes_article_filename_idx" ON "media" USING btree ("sizes_article_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_content_type_idx" ON "articles" USING btree ("content_type");
  CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category_id");
  CREATE INDEX "articles_hero_hero_image_idx" ON "articles" USING btree ("hero_image_id");
  CREATE INDEX "articles_created_by_idx" ON "articles" USING btree ("created_by_id");
  CREATE INDEX "articles_assigned_editor_idx" ON "articles" USING btree ("assigned_editor_id");
  CREATE INDEX "articles_workflow_workflow_editorial_status_idx" ON "articles" USING btree ("workflow_editorial_status");
  CREATE INDEX "articles_publication_publication_published_at_idx" ON "articles" USING btree ("publication_published_at");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_topics_id_idx" ON "articles_rels" USING btree ("topics_id");
  CREATE INDEX "articles_rels_authors_id_idx" ON "articles_rels" USING btree ("authors_id");
  CREATE INDEX "articles_rels_articles_id_idx" ON "articles_rels" USING btree ("articles_id");
  CREATE INDEX "articles_rels_people_id_idx" ON "articles_rels" USING btree ("people_id");
  CREATE INDEX "articles_rels_organizations_id_idx" ON "articles_rels" USING btree ("organizations_id");
  CREATE INDEX "articles_rels_sources_id_idx" ON "articles_rels" USING btree ("sources_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_content_type_idx" ON "_articles_v" USING btree ("version_content_type");
  CREATE INDEX "_articles_v_version_version_category_idx" ON "_articles_v" USING btree ("version_category_id");
  CREATE INDEX "_articles_v_version_hero_version_hero_image_idx" ON "_articles_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_articles_v_version_version_created_by_idx" ON "_articles_v" USING btree ("version_created_by_id");
  CREATE INDEX "_articles_v_version_version_assigned_editor_idx" ON "_articles_v" USING btree ("version_assigned_editor_id");
  CREATE INDEX "_articles_v_version_workflow_version_workflow_editorial__idx" ON "_articles_v" USING btree ("version_workflow_editorial_status");
  CREATE INDEX "_articles_v_version_publication_version_publication_publ_idx" ON "_articles_v" USING btree ("version_publication_published_at");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_rels_order_idx" ON "_articles_v_rels" USING btree ("order");
  CREATE INDEX "_articles_v_rels_parent_idx" ON "_articles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_articles_v_rels_path_idx" ON "_articles_v_rels" USING btree ("path");
  CREATE INDEX "_articles_v_rels_topics_id_idx" ON "_articles_v_rels" USING btree ("topics_id");
  CREATE INDEX "_articles_v_rels_authors_id_idx" ON "_articles_v_rels" USING btree ("authors_id");
  CREATE INDEX "_articles_v_rels_articles_id_idx" ON "_articles_v_rels" USING btree ("articles_id");
  CREATE INDEX "_articles_v_rels_people_id_idx" ON "_articles_v_rels" USING btree ("people_id");
  CREATE INDEX "_articles_v_rels_organizations_id_idx" ON "_articles_v_rels" USING btree ("organizations_id");
  CREATE INDEX "_articles_v_rels_sources_id_idx" ON "_articles_v_rels" USING btree ("sources_id");
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
  CREATE INDEX "investigations_rels_topics_id_idx" ON "investigations_rels" USING btree ("topics_id");
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
  CREATE INDEX "_investigations_v_rels_topics_id_idx" ON "_investigations_v_rels" USING btree ("topics_id");
  CREATE INDEX "_investigations_v_rels_people_id_idx" ON "_investigations_v_rels" USING btree ("people_id");
  CREATE INDEX "_investigations_v_rels_organizations_id_idx" ON "_investigations_v_rels" USING btree ("organizations_id");
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
  CREATE INDEX "evidence_documents_related_investigation_idx" ON "evidence_documents" USING btree ("related_investigation_id");
  CREATE INDEX "evidence_documents_updated_at_idx" ON "evidence_documents" USING btree ("updated_at");
  CREATE INDEX "evidence_documents_created_at_idx" ON "evidence_documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "evidence_documents_filename_idx" ON "evidence_documents" USING btree ("filename");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_active_idx" ON "redirects" USING btree ("active");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "audit_events_timestamp_idx" ON "audit_events" USING btree ("timestamp");
  CREATE INDEX "audit_events_action_idx" ON "audit_events" USING btree ("action");
  CREATE INDEX "audit_events_actor_id_idx" ON "audit_events" USING btree ("actor_id");
  CREATE INDEX "audit_events_resource_type_idx" ON "audit_events" USING btree ("resource_type");
  CREATE INDEX "audit_events_resource_id_idx" ON "audit_events" USING btree ("resource_id");
  CREATE INDEX "audit_events_result_idx" ON "audit_events" USING btree ("result");
  CREATE INDEX "audit_events_updated_at_idx" ON "audit_events" USING btree ("updated_at");
  CREATE INDEX "audit_events_created_at_idx" ON "audit_events" USING btree ("created_at");
  CREATE INDEX "tips_attachments_order_idx" ON "tips_attachments" USING btree ("_order");
  CREATE INDEX "tips_attachments_parent_id_idx" ON "tips_attachments" USING btree ("_parent_id");
  CREATE INDEX "tips_attachments_file_idx" ON "tips_attachments" USING btree ("file_id");
  CREATE INDEX "tips_anonymous_idx" ON "tips" USING btree ("anonymous");
  CREATE INDEX "tips_status_idx" ON "tips" USING btree ("status");
  CREATE INDEX "tips_updated_at_idx" ON "tips" USING btree ("updated_at");
  CREATE INDEX "tips_created_at_idx" ON "tips" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("topics_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_organizations_id_idx" ON "payload_locked_documents_rels" USING btree ("organizations_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_investigations_id_idx" ON "payload_locked_documents_rels" USING btree ("investigations_id");
  CREATE INDEX "payload_locked_documents_rels_opinions_id_idx" ON "payload_locked_documents_rels" USING btree ("opinions_id");
  CREATE INDEX "payload_locked_documents_rels_data_stories_id_idx" ON "payload_locked_documents_rels" USING btree ("data_stories_id");
  CREATE INDEX "payload_locked_documents_rels_video_stories_id_idx" ON "payload_locked_documents_rels" USING btree ("video_stories_id");
  CREATE INDEX "payload_locked_documents_rels_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("sources_id");
  CREATE INDEX "payload_locked_documents_rels_evidence_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("evidence_documents_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_audit_events_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_events_id");
  CREATE INDEX "payload_locked_documents_rels_tips_id_idx" ON "payload_locked_documents_rels" USING btree ("tips_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
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
  CREATE INDEX "homepage_rels_data_stories_id_idx" ON "homepage_rels" USING btree ("data_stories_id");
  CREATE INDEX "breaking_news_related_article_idx" ON "breaking_news" USING btree ("related_article_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "authors_expertise" CASCADE;
  DROP TABLE "authors_social_links" CASCADE;
  DROP TABLE "authors" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "topics" CASCADE;
  DROP TABLE "topics_rels" CASCADE;
  DROP TABLE "people_public_sources" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "people_rels" CASCADE;
  DROP TABLE "organizations_public_sources" CASCADE;
  DROP TABLE "organizations" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_rels" CASCADE;
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
  DROP TABLE "evidence_documents" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "audit_events" CASCADE;
  DROP TABLE "tips_attachments" CASCADE;
  DROP TABLE "tips" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_organization_same_as" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "navigation_primary" CASCADE;
  DROP TABLE "navigation_secondary" CASCADE;
  DROP TABLE "navigation_footer_links" CASCADE;
  DROP TABLE "navigation_footer" CASCADE;
  DROP TABLE "navigation_social" CASCADE;
  DROP TABLE "navigation" CASCADE;
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
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "breaking_news" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_status";
  DROP TYPE "public"."enum_organizations_organization_type";
  DROP TYPE "public"."enum_media_media_type";
  DROP TYPE "public"."enum_media_license";
  DROP TYPE "public"."enum_media_synthetic_media";
  DROP TYPE "public"."enum_articles_content_type";
  DROP TYPE "public"."enum_articles_workflow_editorial_status";
  DROP TYPE "public"."enum_articles_workflow_fact_check_status";
  DROP TYPE "public"."enum_articles_workflow_legal_status";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_content_type";
  DROP TYPE "public"."enum__articles_v_version_workflow_editorial_status";
  DROP TYPE "public"."enum__articles_v_version_workflow_fact_check_status";
  DROP TYPE "public"."enum__articles_v_version_workflow_legal_status";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum_investigations_key_findings_importance";
  DROP TYPE "public"."enum_investigations_workflow_editorial_status";
  DROP TYPE "public"."enum_investigations_workflow_fact_check_status";
  DROP TYPE "public"."enum_investigations_workflow_legal_status";
  DROP TYPE "public"."enum_investigations_status";
  DROP TYPE "public"."enum__investigations_v_version_key_findings_importance";
  DROP TYPE "public"."enum__investigations_v_version_workflow_editorial_status";
  DROP TYPE "public"."enum__investigations_v_version_workflow_fact_check_status";
  DROP TYPE "public"."enum__investigations_v_version_workflow_legal_status";
  DROP TYPE "public"."enum__investigations_v_version_status";
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
  DROP TYPE "public"."enum_sources_visibility";
  DROP TYPE "public"."enum_redirects_status_code";
  DROP TYPE "public"."enum_audit_events_action";
  DROP TYPE "public"."enum_audit_events_result";
  DROP TYPE "public"."enum_tips_status";
  DROP TYPE "public"."enum_navigation_primary_link_type";
  DROP TYPE "public"."enum_navigation_secondary_link_type";
  DROP TYPE "public"."enum_navigation_footer_links_link_type";
  DROP TYPE "public"."enum_breaking_news_severity";`)
}
