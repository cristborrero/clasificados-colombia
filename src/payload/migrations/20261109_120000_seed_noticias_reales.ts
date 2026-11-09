import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { publicarNoticiasReales } from '../scripts/publicar-noticias-reales'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await publicarNoticiasReales(payload)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op
}
