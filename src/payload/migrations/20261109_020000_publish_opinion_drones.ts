import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { publicarOpinion, OPINION_SLUG } from '../scripts/publicar-opinion-drones'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await publicarOpinion(payload)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  const existing = await payload.find({
    collection: 'opinions',
    where: { slug: { equals: OPINION_SLUG } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    await payload.delete({
      collection: 'opinions',
      id: existing.docs[0].id,
      overrideAccess: true,
    })
  }
}

