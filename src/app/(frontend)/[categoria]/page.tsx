import type { Metadata } from 'next'
import Link from 'next/link'
import { redirectOrNotFound } from '@/lib/navigation/notFound'

import { ArticleCardFeatured } from '@/components/articles/ArticleCardFeatured'
import { LatestNewsList } from '@/components/articles/LatestNewsList'
import { Breadcrumbs } from '@/components/articles/Breadcrumbs'
import { Lead, HeadlineXL } from '@/components/editorial/Typography'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { getCategoryBySlug } from '@/data/profiles'
import { getSiteSettings } from '@/data/site'
import { JsonLd } from '@/components/seo/JsonLd'
import { categoryPath } from '@/lib/routes'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structuredData'

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
type Params = { params: Promise<{ categoria: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { categoria } = await params
  const category = await getCategoryBySlug(categoria)

  if (!category) return { title: 'Sección no encontrada', robots: { index: false } }

  return buildPageMetadata({
    title: category.name,
    description: category.description,
    path: categoryPath(category.slug),
  })
}

export default async function CategoryPage({ params }: Params) {
  const { categoria } = await params

  /*
   * The hub lives at the root (PRD SEO §57), so this route also receives paths
   * that are not categories at all. `getCategoryBySlug` returning null is the
   * 404 for those — a reserved segment never reaches here, because Next
   * resolves static routes like /buscar before this dynamic one.
   */
  const [category, settings] = await Promise.all([
    getCategoryBySlug(categoria),
    getSiteSettings(),
  ])

  if (!category) return redirectOrNotFound(categoryPath(categoria))

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: settings.siteName, path: '/' },
          { name: category.name },
        ])}
      />

      <Container width="wide" className="py-12">
        <Breadcrumbs
          items={[{ label: settings.siteName, href: '/' }, { label: category.name }]}
          className="mb-8"
        />

        <div className="mx-auto flex max-w-3xl flex-col items-center text-center gap-4 border-b border-[var(--color-border)] pb-8">
          <HeadlineXL className="text-balance">{category.name}</HeadlineXL>

          {category.description ? (
            <Lead className="mx-auto text-balance text-[color:var(--color-text-muted)]">
              {category.description}
            </Lead>
          ) : null}

          {category.subsections.length > 0 ? (
            <nav aria-label="Subsecciones" className="mt-2">
              <ul className="flex flex-wrap justify-center gap-2.5">
                {category.subsections.map((subsection) => (
                  <li key={subsection.slug}>
                    <Link
                      href={categoryPath(subsection.slug)}
                      className="inline-block border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-1.5 font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)] font-medium no-underline transition-colors hover:bg-[var(--color-surface-sunken)] hover:border-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                    >
                      {subsection.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </Container>

      {category.featured ? (
        <Container width="wide" as="section" className="pb-12">
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

      <Container width="wide" as="section" className="pb-24">
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
