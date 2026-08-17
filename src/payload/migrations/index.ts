import * as migration_20260817_145533_initial_editorial_schema from './20260817_145533_initial_editorial_schema';

export const migrations = [
  {
    up: migration_20260817_145533_initial_editorial_schema.up,
    down: migration_20260817_145533_initial_editorial_schema.down,
    name: '20260817_145533_initial_editorial_schema'
  },
];
