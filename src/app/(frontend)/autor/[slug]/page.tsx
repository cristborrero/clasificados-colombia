import type { Metadata } from 'next'
import Image from 'next/image'
import { redirectOrNotFound } from '@/lib/navigation/notFound'

import { ArticleCard } from '@/components/articles/ArticleCard'
import { LatestNewsList } from '@/components/articles/LatestNewsList'
import { Body, HeadlineXL, Metadata as MetaText } from '@/components/editorial/Typography'
import { InvestigationCard } from '@/components/investigations/InvestigationCard'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { getAuthorBySlug } from '@/data/profiles'
import { getSiteSettings } from '@/data/site'
import { JsonLd } from '@/components/seo/JsonLd'
import { authorPath } from '@/lib/routes'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { personJsonLd } from '@/lib/seo/structuredData'

/**
 * Author page (PRD Nº8 §89, PRD SEO §31).
 *
 * Portrait, name, role, bio, expertise, then their work.
 *
 * This is not a vanity page. PRD SEO §31 ties published journalism to an
 * identifiable, traceable author, and a reader deciding whether to believe an
 * investigation into public contracting reasonably wants to know who wrote it
 * and what else they have covered. The expertise list and the back catalogue
 * are the answer to that question.
 */
type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)

  if (!author) return { title: 'Autor no encontrado', robots: { index: false } }

  return buildPageMetadata({
    title: author.name,
    description: author.bio ?? author.jobTitle,
    path: authorPath(author.slug),
    image: author.portrait,
  })
}

export default async function AuthorPage({ params }: Params) {
  const { slug } = await params
  const [author, settings] = await Promise.all([getAuthorBySlug(slug), getSiteSettings()])

  if (!author) return redirectOrNotFound(authorPath(slug))

  return (
    <>
      {/* PRD SEO §33-§34: a real profile, tied to the publisher. This is the
          page that makes a byline traceable. */}
      <JsonLd
        data={personJsonLd({
          name: author.name,
          slug: author.slug,
          jobTitle: author.jobTitle,
          bio: author.bio,
          image: author.portrait?.url,
          organizationName: settings.siteName,
        })}
      />

      <Container width="article" className="py-16">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          {author.portrait ? (
            <Image
              src={author.portrait.url}
              alt={author.portrait.alt}
              width={320}
              height={320}
              sizes="128px"
              priority
              className="size-32 shrink-0 rounded-full object-cover"
            />
          ) : null}

          <div className="flex flex-col gap-3">
            <HeadlineXL className="text-[length:var(--text-h2)]">{author.name}</HeadlineXL>

            {author.jobTitle ? (
              <MetaText className="text-[color:var(--color-text-muted)]">{author.jobTitle}</MetaText>
            ) : null}

            {author.bio ? <Body className="max-w-[60ch]">{author.bio}</Body> : null}

            {author.expertise.length > 0 ? (
              <div className="mt-2">
                <h2 className="font-[family-name:var(--font-sans)] text-[length:var(--text-label)] tracking-[var(--text-label--letter-spacing)] text-[color:var(--color-text-muted)] uppercase">
                  Cubre
                </h2>

                <ul className="mt-2 flex flex-wrap gap-2">
                  {author.expertise.map((area) => (
                    <li
                      key={area}
                      className="border border-[var(--color-border)] px-3 py-1 font-[family-name:var(--font-sans)] text-[length:var(--text-metadata)]"
                    >
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </header>
      </Container>

      {author.investigations.length > 0 ? (
        <Container width="editorial" as="section" className="pb-16">
          <SectionHeader title="Investigaciones" />

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {author.investigations.map((item) => (
              <InvestigationCard
                key={item.slug}
                investigation={{
                  slug: item.slug,
                  title: item.title,
                  dek: item.dek,
                  publishedAt: item.publishedAt,
                  authors: item.authors,
                  image: item.image,
                }}
              />
            ))}
          </div>
        </Container>
      ) : null}

      <Container width="editorial" as="section" className="pb-24">
        <SectionHeader title="Publicaciones recientes" />

        {author.articles.length > 0 ? (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {author.articles.slice(0, 6).map((item) => (
              <ArticleCard
                key={item.slug}
                article={{
                  slug: item.slug,
                  title: item.title,
                  dek: item.dek,
                  publishedAt: item.publishedAt,
                  category: item.category,
                  authors: item.authors,
                  image: item.image,
                }}
              />
            ))}
          </div>
        ) : (
          <LatestNewsList
            articles={[]}
            emptyMessage={`Todavía no hay publicaciones firmadas por ${author.name}.`}
          />
        )}
      </Container>
    </>
  )
}
