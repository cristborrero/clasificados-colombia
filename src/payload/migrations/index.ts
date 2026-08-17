import * as migration_20260817_145533_initial_editorial_schema from './20260817_145533_initial_editorial_schema';
import * as migration_20260817_182831_users_editorial_roles from './20260817_182831_users_editorial_roles';
import * as migration_20260817_220553_taxonomy_authors_categories_topics from './20260817_220553_taxonomy_authors_categories_topics';

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
    name: '20260817_220553_taxonomy_authors_categories_topics'
  },
];
