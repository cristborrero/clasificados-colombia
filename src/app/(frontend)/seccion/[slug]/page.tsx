import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleCardFeatured } from '@/components/articles/ArticleCardFeatured'
import { LatestNewsList } from '@/components/articles/LatestNewsList'
import { Breadcrumbs } from '@/components/articles/Breadcrumbs'
import { categoryPath } from '@/components/articles/types'
import { Lead, HeadlineXL } from '@/components/editorial/Typography'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { getCategoryBySlug } from '@/data/profiles'
import { getSiteSettings } from '@/data/site'

/**
 * Section page (PRD Nº8 §90, PRD SEO §57).
 *
 * *"No simple listado plano."* Three things make it a page rather than a query
 * result: an introduction written by the newsroom, one story promoted above the
 * rest, and the subsections that live inside it.
 *
 * PRD SEO §57 asks for the same thing from a different direction — a section
 * page with no editorial content of its own is a thin page, and a search engine
 * treats it accordingly.
 */
type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) return { title: 'Sección no encontrada' }

  return { title: category.name, description: category.description ?? undefined }
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params

  const [category, settings] = await Promise.all([getCategoryBySlug(slug), getSiteSettings()])

  if (!category) notFound()

  return (
    <>
      <Container width="editorial" className="py-12">
        <Breadcrumbs
          items={[{ label: settings.siteName, href: '/' }, { label: category.name }]}
          className="mb-8"
        />

        <HeadlineXL className="text-[length:var(--text-h2)]">{category.name}</HeadlineXL>

        {category.description ? (
          <Lead className="mt-4 max-w-[60ch] text-[color:var(--color-text-muted)]">
            {category.description}
          </Lead>
        ) : null}

        {category.subsections.length > 0 ? (
          <nav aria-label="Subsecciones" className="mt-8">
            <ul className="flex flex-wrap gap-3">
              {category.subsections.map((subsection) => (
                <li key={subsection.slug}>
                  <Link
                    href={categoryPath(subsection.slug)}
                    className="inline-block border border-[var(--color-border)] px-4 py-2 font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)] no-underline hover:bg-[var(--color-surface-sunken)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                  >
                    {subsection.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </Container>

      {category.featured ? (
        <Container width="editorial" as="section" className="pb-12">
          <ArticleCardFeatured
            article={{
              slug: category.featured.slug,
              title: category.featured.title,
              dek: category.featured.dek,
              publishedAt: category.featured.publishedAt,
              category: category.featured.category,
              authors: category.featured.authors,
              image: category.featured.image,
            }}
          />
        </Container>
      ) : null}

      <Container width="editorial" as="section" className="pb-24">
        <SectionHeader title="Lo último" />

        <LatestNewsList
          articles={category.latest.map((item) => ({
            slug: item.slug,
            title: item.title,
            dek: item.dek,
            publishedAt: item.publishedAt,
            category: item.category,
            authors: item.authors,
            image: item.image,
          }))}
          emptyMessage={`Todavía no hay más publicaciones en ${category.name}.`}
        />
      </Container>
    </>
  )
}
