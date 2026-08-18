import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "data_stories" ADD COLUMN "headline_figure" varchar;
  ALTER TABLE "data_stories" ADD COLUMN "headline_figure_context" varchar;
  ALTER TABLE "_data_stories_v" ADD COLUMN "version_headline_figure" varchar;
  ALTER TABLE "_data_stories_v" ADD COLUMN "version_headline_figure_context" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "data_stories" DROP COLUMN "headline_figure";
  ALTER TABLE "data_stories" DROP COLUMN "headline_figure_context";
  ALTER TABLE "_data_stories_v" DROP COLUMN "version_headline_figure";
  ALTER TABLE "_data_stories_v" DROP COLUMN "version_headline_figure_context";`)
}
