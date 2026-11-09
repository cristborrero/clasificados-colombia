import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { publicarOpinion } from '../scripts/publicar-opinion-drones'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await publicarOpinion(payload)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op
}

