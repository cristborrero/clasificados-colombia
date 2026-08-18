import * as migration_20260818_105351_initial from './20260818_105351_initial';

export const migrations = [
  {
    up: migration_20260818_105351_initial.up,
    down: migration_20260818_105351_initial.down,
    name: '20260818_105351_initial'
  },
];
