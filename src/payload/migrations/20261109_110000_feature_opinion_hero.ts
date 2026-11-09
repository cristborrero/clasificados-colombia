import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up(_args: MigrateUpArgs): Promise<void> {
  // Safe no-op migration to ensure consistent schema progression
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op
}
