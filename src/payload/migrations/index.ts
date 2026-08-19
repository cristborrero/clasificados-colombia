import * as migration_20260818_105351_initial from './20260818_105351_initial';
import * as migration_20260819_015647_f15_media_pipeline from './20260819_015647_f15_media_pipeline';
import * as migration_20260819_055622_f17_corrections from './20260819_055622_f17_corrections';

export const migrations = [
  {
    up: migration_20260818_105351_initial.up,
    down: migration_20260818_105351_initial.down,
    name: '20260818_105351_initial',
  },
  {
    up: migration_20260819_015647_f15_media_pipeline.up,
    down: migration_20260819_015647_f15_media_pipeline.down,
    name: '20260819_015647_f15_media_pipeline',
  },
  {
    up: migration_20260819_055622_f17_corrections.up,
    down: migration_20260819_055622_f17_corrections.down,
    name: '20260819_055622_f17_corrections'
  },
];
