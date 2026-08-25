import type { Metadata } from 'next'
import { redirectOrNotFound } from '@/lib/navigation/notFound'

import { ArticleCard } from '@/components/articles/ArticleCard'
import { Breadcrumbs } from '@/components/articles/Breadcrumbs'
import { LatestNewsList } from '@/components/articles/LatestNewsList'
import { Lead, HeadlineXL } from '@/components/editorial/Typography'
import { InvestigationCard } from '@/components/investigations/InvestigationCard'
import { Container } from '@/components/layout/Container'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { getTopicBySlug } from '@/data/profiles'
import { getSiteSettings } from '@/data/site'
import { JsonLd } from '@/components/seo/JsonLd'
import { topicPath } from '@/lib/routes'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structuredData'

/**
 * Topic page (PRD Nº8 §91).
 *
 * *"Similar a Category pero más contextual."* The difference is what a topic
 * is: a section is where a story is filed, a topic is what a story is about,
 * and a topic accumulates across sections over years.
 *
 * So the investigations come first here, where the section page leads with the
 * newest thing. Someone arriving at a topic page has usually arrived mid-story
 * and needs the substantial work, not the most recent update.
 */
type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const topic = await getTopicBySlug(slug)

  if (!topic) return { title: 'Tema no encontrado', robots: { index: false } }

  return buildPageMetadata({
    title: topic.name,
    description: topic.description,
    path: topicPath(topic.slug),
  })
}

export default async function TopicPage({ params }: Params) {
  const { slug } = await params

  const [topic, settings] = await Promise.all([getTopicBySlug(slug), getSiteSettings()])

  if (!topic) return redirectOrNotFound(topicPath(slug))

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: settings.siteName, path: '/' },
          { name: 'Temas' },
          { name: topic.name },
        ])}
      />

      <Container width="wide" className="py-12">
        <Breadcrumbs
          items={[{ label: settings.siteName, href: '/' }, { label: topic.name }]}
          className="mb-8"
        />

        <div className="mx-auto max-w-2xl text-center">
          <p className="font-sans text-[length:var(--text-label)] font-semibold tracking-[var(--text-label--letter-spacing)] uppercase text-[color:var(--color-accent)]">
            Tema
          </p>
          <HeadlineXL className="mt-2 text-[length:var(--text-h2)]">{topic.name}</HeadlineXL>

          {topic.description ? (
            <Lead className="mx-auto mt-4 max-w-[56ch] text-[color:var(--color-text-muted)]">
              {topic.description}
            </Lead>
          ) : null}
        </div>
      </Container>

      {topic.investigations.length > 0 ? (
        <Container width="wide" as="section" className="pb-12">
          <SectionHeader title="Investigaciones" />

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {topic.investigations.map((item) => (
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

      <Container width="wide" as="section" className="pb-24">
        <SectionHeader title="Cobertura" />

        {topic.articles.length > 0 ? (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {topic.articles.map((item) => (
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
            emptyMessage={`Todavía no hay cobertura publicada sobre ${topic.name}.`}
          />
        )}
      </Container>
    </>
  )
}
