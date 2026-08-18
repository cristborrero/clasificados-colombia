import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_evidence_classification" AS ENUM('public', 'internal', 'restricted');
  CREATE TYPE "public"."enum_evidence_status" AS ENUM('pending', 'verified', 'approved', 'quarantined', 'archived');
  CREATE TYPE "public"."enum_audit_events_action" AS ENUM('login_success', 'login_failure', 'user_created', 'user_disabled', 'role_changed', 'content_published', 'content_unpublished', 'content_deleted', 'evidence_uploaded', 'evidence_downloaded', 'evidence_access_denied', 'classification_changed', 'access_granted', 'access_revoked', 'legal_hold_changed', 'settings_changed');
  CREATE TYPE "public"."enum_audit_events_result" AS ENUM('allowed', 'denied');
  CREATE TABLE "evidence" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"classification" "enum_evidence_classification" DEFAULT 'restricted' NOT NULL,
  	"status" "enum_evidence_status" DEFAULT 'pending' NOT NULL,
  	"bucket" varchar,
  	"object_key" varchar,
  	"mime_type" varchar,
  	"size" numeric,
  	"checksum" varchar,
  	"related_investigation_id" integer,
  	"retention" timestamp(3) with time zone,
  	"legal_hold" boolean DEFAULT false,
  	"uploaded_by_id" integer,
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
  
  CREATE TABLE "evidence_access_grants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"evidence_id" integer NOT NULL,
  	"granted_by_id" integer,
  	"reason" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone,
  	"revoked_at" timestamp(3) with time zone,
  	"revoked_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "investigation_teams" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"investigation_id" integer NOT NULL,
  	"lead_id" integer,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "investigation_teams_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "evidence_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "audit_events_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "evidence_access_grants_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "investigation_teams_id" integer;
  ALTER TABLE "evidence" ADD CONSTRAINT "evidence_related_investigation_id_investigations_id_fk" FOREIGN KEY ("related_investigation_id") REFERENCES "public"."investigations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "evidence" ADD CONSTRAINT "evidence_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "evidence_access_grants" ADD CONSTRAINT "evidence_access_grants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "evidence_access_grants" ADD CONSTRAINT "evidence_access_grants_evidence_id_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "evidence_access_grants" ADD CONSTRAINT "evidence_access_grants_granted_by_id_users_id_fk" FOREIGN KEY ("granted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "evidence_access_grants" ADD CONSTRAINT "evidence_access_grants_revoked_by_id_users_id_fk" FOREIGN KEY ("revoked_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "investigation_teams" ADD CONSTRAINT "investigation_teams_investigation_id_investigations_id_fk" FOREIGN KEY ("investigation_id") REFERENCES "public"."investigations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "investigation_teams" ADD CONSTRAINT "investigation_teams_lead_id_users_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "investigation_teams_rels" ADD CONSTRAINT "investigation_teams_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."investigation_teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "investigation_teams_rels" ADD CONSTRAINT "investigation_teams_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "evidence_classification_idx" ON "evidence" USING btree ("classification");
  CREATE INDEX "evidence_status_idx" ON "evidence" USING btree ("status");
  CREATE INDEX "evidence_related_investigation_idx" ON "evidence" USING btree ("related_investigation_id");
  CREATE INDEX "evidence_uploaded_by_idx" ON "evidence" USING btree ("uploaded_by_id");
  CREATE INDEX "evidence_updated_at_idx" ON "evidence" USING btree ("updated_at");
  CREATE INDEX "evidence_created_at_idx" ON "evidence" USING btree ("created_at");
  CREATE INDEX "audit_events_timestamp_idx" ON "audit_events" USING btree ("timestamp");
  CREATE INDEX "audit_events_action_idx" ON "audit_events" USING btree ("action");
  CREATE INDEX "audit_events_actor_id_idx" ON "audit_events" USING btree ("actor_id");
  CREATE INDEX "audit_events_resource_type_idx" ON "audit_events" USING btree ("resource_type");
  CREATE INDEX "audit_events_resource_id_idx" ON "audit_events" USING btree ("resource_id");
  CREATE INDEX "audit_events_result_idx" ON "audit_events" USING btree ("result");
  CREATE INDEX "audit_events_updated_at_idx" ON "audit_events" USING btree ("updated_at");
  CREATE INDEX "audit_events_created_at_idx" ON "audit_events" USING btree ("created_at");
  CREATE INDEX "evidence_access_grants_user_idx" ON "evidence_access_grants" USING btree ("user_id");
  CREATE INDEX "evidence_access_grants_evidence_idx" ON "evidence_access_grants" USING btree ("evidence_id");
  CREATE INDEX "evidence_access_grants_granted_by_idx" ON "evidence_access_grants" USING btree ("granted_by_id");
  CREATE INDEX "evidence_access_grants_revoked_by_idx" ON "evidence_access_grants" USING btree ("revoked_by_id");
  CREATE INDEX "evidence_access_grants_updated_at_idx" ON "evidence_access_grants" USING btree ("updated_at");
  CREATE INDEX "evidence_access_grants_created_at_idx" ON "evidence_access_grants" USING btree ("created_at");
  CREATE INDEX "investigation_teams_investigation_idx" ON "investigation_teams" USING btree ("investigation_id");
  CREATE INDEX "investigation_teams_lead_idx" ON "investigation_teams" USING btree ("lead_id");
  CREATE INDEX "investigation_teams_active_idx" ON "investigation_teams" USING btree ("active");
  CREATE INDEX "investigation_teams_updated_at_idx" ON "investigation_teams" USING btree ("updated_at");
  CREATE INDEX "investigation_teams_created_at_idx" ON "investigation_teams" USING btree ("created_at");
  CREATE INDEX "investigation_teams_rels_order_idx" ON "investigation_teams_rels" USING btree ("order");
  CREATE INDEX "investigation_teams_rels_parent_idx" ON "investigation_teams_rels" USING btree ("parent_id");
  CREATE INDEX "investigation_teams_rels_path_idx" ON "investigation_teams_rels" USING btree ("path");
  CREATE INDEX "investigation_teams_rels_users_id_idx" ON "investigation_teams_rels" USING btree ("users_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_evidence_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."evidence"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_events_fk" FOREIGN KEY ("audit_events_id") REFERENCES "public"."audit_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_evidence_access_grants_fk" FOREIGN KEY ("evidence_access_grants_id") REFERENCES "public"."evidence_access_grants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_investigation_teams_fk" FOREIGN KEY ("investigation_teams_id") REFERENCES "public"."investigation_teams"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_evidence_id_idx" ON "payload_locked_documents_rels" USING btree ("evidence_id");
  CREATE INDEX "payload_locked_documents_rels_audit_events_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_events_id");
  CREATE INDEX "payload_locked_documents_rels_evidence_access_grants_id_idx" ON "payload_locked_documents_rels" USING btree ("evidence_access_grants_id");
  CREATE INDEX "payload_locked_documents_rels_investigation_teams_id_idx" ON "payload_locked_documents_rels" USING btree ("investigation_teams_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "evidence" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audit_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "evidence_access_grants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "investigation_teams" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "investigation_teams_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "evidence" CASCADE;
  DROP TABLE "audit_events" CASCADE;
  DROP TABLE "evidence_access_grants" CASCADE;
  DROP TABLE "investigation_teams" CASCADE;
  DROP TABLE "investigation_teams_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_evidence_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_audit_events_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_evidence_access_grants_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_investigation_teams_fk";
  
  DROP INDEX "payload_locked_documents_rels_evidence_id_idx";
  DROP INDEX "payload_locked_documents_rels_audit_events_id_idx";
  DROP INDEX "payload_locked_documents_rels_evidence_access_grants_id_idx";
  DROP INDEX "payload_locked_documents_rels_investigation_teams_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "evidence_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "audit_events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "evidence_access_grants_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "investigation_teams_id";
  DROP TYPE "public"."enum_evidence_classification";
  DROP TYPE "public"."enum_evidence_status";
  DROP TYPE "public"."enum_audit_events_action";
  DROP TYPE "public"."enum_audit_events_result";`)
}
