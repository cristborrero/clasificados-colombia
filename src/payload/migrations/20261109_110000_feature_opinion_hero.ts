import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up(_args: MigrateUpArgs): Promise<void> {
  // No-op: Hero selection automatically resolves the most recent published editorial piece
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op
}
