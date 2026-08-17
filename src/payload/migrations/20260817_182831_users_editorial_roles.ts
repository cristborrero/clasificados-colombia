import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('administrator', 'editor_in_chief', 'investigative_editor', 'editor', 'reporter', 'fact_checker', 'legal_reviewer', 'photo_editor', 'contributor');
  CREATE TYPE "public"."enum_users_status" AS ENUM('active', 'suspended', 'disabled');
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'contributor' NOT NULL;
  ALTER TABLE "users" ADD COLUMN "status" "enum_users_status" DEFAULT 'active' NOT NULL;
  ALTER TABLE "users" ADD COLUMN "department" varchar;
  ALTER TABLE "users" ADD COLUMN "mfa_enabled" boolean DEFAULT false;
  ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "password_changed_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "security_notes" varchar;
  CREATE INDEX "users_role_idx" ON "users" USING btree ("role");
  CREATE INDEX "users_status_idx" ON "users" USING btree ("status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "users_role_idx";
  DROP INDEX "users_status_idx";
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "users" DROP COLUMN "status";
  ALTER TABLE "users" DROP COLUMN "department";
  ALTER TABLE "users" DROP COLUMN "mfa_enabled";
  ALTER TABLE "users" DROP COLUMN "last_login_at";
  ALTER TABLE "users" DROP COLUMN "password_changed_at";
  ALTER TABLE "users" DROP COLUMN "security_notes";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_status";`)
}
