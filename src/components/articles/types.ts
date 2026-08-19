import type { EditorialSummary } from '@/data/collections'

/**
 * What a card needs to render.
 *
 * Structurally the same as `ArticleSummary`, but declared here as its own type
 * so the cards never import from `src/data/`. A card takes props; it does not
 * know a database exists. That is what lets one be tested with an object
 * literal instead of a running Postgres.
 */
export type CardArticle = {
  slug: string
  title: string
  dek?: string | null
  publishedAt?: string | null
  category?: { name: string; slug: string } | null
  authors?: { name: string; slug: string }[]
  image?: { url: string; alt: string } | null
}

/** Compile-time proof that the data layer satisfies what the cards need. */
export type _CardArticleMatchesData = EditorialSummary extends CardArticle ? true : never

/*
 * Paths come from `src/lib/routes.ts`, which is the single place that decides
 * what a public URL looks like. Re-exported here so the card components keep
 * one import, not because this file owns the decision.
 */
export { articlePath, categoryPath } from '@/lib/routes'
