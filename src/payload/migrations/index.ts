import * as migration_20260817_145533_initial_editorial_schema from './20260817_145533_initial_editorial_schema';
import * as migration_20260817_182831_users_editorial_roles from './20260817_182831_users_editorial_roles';
import * as migration_20260817_220553_taxonomy_authors_categories_topics from './20260817_220553_taxonomy_authors_categories_topics';
import * as migration_20260817_222327_articles_media_redirects from './20260817_222327_articles_media_redirects';
import * as migration_20260818_005628_entities_and_content_types from './20260818_005628_entities_and_content_types';
import * as migration_20260818_012946_investigations from './20260818_012946_investigations';
import * as migration_20260818_032404_evidence_vault_and_audit from './20260818_032404_evidence_vault_and_audit';

export const migrations = [
  {
    up: migration_20260817_145533_initial_editorial_schema.up,
    down: migration_20260817_145533_initial_editorial_schema.down,
    name: '20260817_145533_initial_editorial_schema',
  },
  {
    up: migration_20260817_182831_users_editorial_roles.up,
    down: migration_20260817_182831_users_editorial_roles.down,
    name: '20260817_182831_users_editorial_roles',
  },
  {
    up: migration_20260817_220553_taxonomy_authors_categories_topics.up,
    down: migration_20260817_220553_taxonomy_authors_categories_topics.down,
    name: '20260817_220553_taxonomy_authors_categories_topics',
  },
  {
    up: migration_20260817_222327_articles_media_redirects.up,
    down: migration_20260817_222327_articles_media_redirects.down,
    name: '20260817_222327_articles_media_redirects',
  },
  {
    up: migration_20260818_005628_entities_and_content_types.up,
    down: migration_20260818_005628_entities_and_content_types.down,
    name: '20260818_005628_entities_and_content_types',
  },
  {
    up: migration_20260818_012946_investigations.up,
    down: migration_20260818_012946_investigations.down,
    name: '20260818_012946_investigations',
  },
  {
    up: migration_20260818_032404_evidence_vault_and_audit.up,
    down: migration_20260818_032404_evidence_vault_and_audit.down,
    name: '20260818_032404_evidence_vault_and_audit'
  },
];
