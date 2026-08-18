import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/articles/Breadcrumbs'
import { ShareActions } from '@/components/articles/ShareActions'
import { RichText } from '@/components/editorial/RichText'
import { Body, HeadlineLG } from '@/components/editorial/Typography'
import { EditorialTimeline } from '@/components/investigations/EditorialTimeline'
import { EntityList } from '@/components/investigations/EntityList'
import { EvidenceSection } from '@/components/investigations/EvidenceSection'
import { InvestigationContents } from '@/components/investigations/InvestigationContents'
import { InvestigationHero } from '@/components/investigations/InvestigationHero'
import { KeyFindings } from '@/components/investigations/KeyFindings'
import { MethodologySection } from '@/components/investigations/MethodologySection'
import { Container } from '@/components/layout/Container'
import { getInvestigationBySlug } from '@/data/investigation'
import { getSiteSettings } from '@/data/site'

/**
 * Investigation template (PRD Nº8 §76-§88).
 *
 * *"Debe sentirse más inmersivo"* — and the immersion is structural rather than
 * decorative: a dark hero, a chapter rail that follows the reader, findings
 * numbered so they can be cited, a chronology, the named entities with their
 * context, the methodology, and the public documents.
 *
 * The order is not arbitrary. Findings come before chapters because a reader
 * deciding whether to spend twenty minutes needs to know what was found;
 * methodology comes before the documents because it explains what the documents
 * are for.
 */
type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const investigation = await getInvestigationBySlug(slug)

  if (!investigation) return { title: 'Contenido no encontrado' }

  return {
    title: investigation.title,
    description: investigation.summary ?? undefined,
  }
}

export default async function InvestigationPage({ params }: Params) {
  const { slug } = await params

  const [investigation, settings] = await Promise.all([
    getInvestigationBySlug(slug),
    getSiteSettings(),
  ])

  // Reached with `overrideAccess: false`, so an unpublished investigation is
  // simply absent — the page never has to decide whether it may show a draft.
  if (!investigation) notFound()

  return (
    <article>
      <InvestigationHero
        title={investigation.title}
        summary={investigation.summary}
        authors={investigation.authors}
        publishedAt={investigation.publishedAt}
        updatedAt={investigation.updatedAt}
        image={investigation.hero.image}
        caption={investigation.hero.caption}
        credit={investigation.hero.credit}
      />

      <Container width="article" className="pt-8">
        <Breadcrumbs
          items={[
            { label: settings.siteName, href: '/' },
            { label: 'Investigaciones', href: '/investigaciones' },
            { label: investigation.title },
          ]}
        />

        <ShareActions
          url={`/investigacion/${investigation.slug}`}
          title={investigation.title}
          className="mt-6"
        />
      </Container>

      <Container width="article">
        <KeyFindings findings={investigation.keyFindings} />
      </Container>

      {investigation.chapters.length > 0 ? (
        <Container width="editorial" className="my-16">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <InvestigationContents chapters={investigation.chapters} />
            </div>

            <div className="flex flex-col gap-16 lg:col-span-8 lg:col-start-5">
              {investigation.chapters.map((chapter) => (
                <section key={chapter.slug} id={chapter.slug} aria-labelledby={`${chapter.slug}-t`}>
                  <HeadlineLG as="h2" id={`${chapter.slug}-t`}>
                    {chapter.title}
                  </HeadlineLG>

                  {chapter.intro ? (
                    <Body className="mt-4 max-w-[60ch] text-[color:var(--color-text-muted)]">
                      {chapter.intro}
                    </Body>
                  ) : null}

                  <RichText data={chapter.body} className="mt-6" />
                </section>
              ))}
            </div>
          </div>
        </Container>
      ) : null}

      <Container width="article">
        <EditorialTimeline events={investigation.timeline} />

        <EntityList entities={investigation.entities} />

        {investigation.methodology ? (
          <MethodologySection methodology={investigation.methodology} />
        ) : null}

        <EvidenceSection evidence={investigation.evidence} />
      </Container>
    </article>
  )
}
