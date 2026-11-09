import * as migration_20260818_105351_initial from './20260818_105351_initial';
import * as migration_20260819_015647_f15_media_pipeline from './20260819_015647_f15_media_pipeline';
import * as migration_20260819_055622_f17_corrections from './20260819_055622_f17_corrections';
import * as migration_20260819_074919_f18_jobs from './20260819_074919_f18_jobs';
import * as migration_20260819_182314_f_trio_banda from './20260819_182314_f_trio_banda';
import * as migration_20261109_020000_publish_opinion_drones from './20261109_020000_publish_opinion_drones';
import * as migration_20261109_030500_seed_opinion_media from './20261109_030500_seed_opinion_media';

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
    name: '20260819_055622_f17_corrections',
  },
  {
    up: migration_20260819_074919_f18_jobs.up,
    down: migration_20260819_074919_f18_jobs.down,
    name: '20260819_074919_f18_jobs',
  },
  {
    up: migration_20260819_182314_f_trio_banda.up,
    down: migration_20260819_182314_f_trio_banda.down,
    name: '20260819_182314_f_trio_banda'
  },
  {
    up: migration_20261109_020000_publish_opinion_drones.up,
    down: migration_20261109_020000_publish_opinion_drones.down,
    name: '20261109_020000_publish_opinion_drones'
  },
  {
    up: migration_20261109_030500_seed_opinion_media.up,
    down: migration_20261109_030500_seed_opinion_media.down,
    name: '20261109_030500_seed_opinion_media'
  },
];
