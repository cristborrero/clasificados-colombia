import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  // 1. Agregar columna opinions_id y clave foránea a homepage_rels para permitir que el hero referencie opiniones
  await db.execute(sql`
    ALTER TABLE "homepage_rels" ADD COLUMN IF NOT EXISTS "opinions_id" integer;
    DO $$ BEGIN
      ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_opinions_fk" FOREIGN KEY ("opinions_id") REFERENCES "public"."opinions"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
    CREATE INDEX IF NOT EXISTS "homepage_rels_opinions_id_idx" ON "homepage_rels" USING btree ("opinions_id");
  `)

  // 2. Vincular la columna de opinión de los drones como el Hero de la portada
  try {
    const opinion = (
      await payload.find({
        collection: 'opinions',
        where: { slug: { equals: 'seis-semanas-despues-de-la-promesa-llegaron-los-drones' } },
        limit: 1,
        overrideAccess: true,
      })
    ).docs[0]

    if (opinion) {
      const homepage = await payload.findGlobal({
        slug: 'homepage',
        overrideAccess: true,
      })

      if (homepage && Array.isArray(homepage.bands)) {
        const bands = homepage.bands.map((band: Record<string, unknown>) => {
          if (band.blockType === 'hero') {
            return {
              ...band,
              article: {
                relationTo: 'opinions',
                value: opinion.id,
              },
            }
          }
          return band
        })

        await payload.updateGlobal({
          slug: 'homepage',
          data: { bands } as never,
          overrideAccess: true,
        })
        payload.logger.info('Portada actualizada: la columna de drones ahora es la historia dominante (Hero).')
      }
    }
  } catch (err) {
    payload.logger.warn(`No se pudo actualizar el Hero de portada automáticamente: ${err}`)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "homepage_rels" SET "opinions_id" = NULL WHERE "opinions_id" IS NOT NULL;
  `)
}
