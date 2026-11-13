import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { publicarNoticiasReales } from '../scripts/publicar-noticias-reales'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  try {
    await publicarNoticiasReales(payload)
  } catch (error) {
    payload.logger.error(`Error en migración publish_latest_breaking_news: ${error}`)
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op
}
