import { HomepageBands } from '@/components/homepage/HomepageBands'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Container } from '@/components/layout/Container'
import { getHomepage } from '@/data/homepage'

/**
 * The front page (PRD Nº8 §37, DoD F10).
 *
 * Reads its own running order. Nothing about which bands appear, or in what
 * sequence, is decided here — that is the Homepage Global, and it is editable
 * without a deploy.
 *
 * The `h1` lives here rather than in the hero, and it is visually hidden. The
 * hero's headline is the largest text on the page but it is the *story's*
 * title, not the page's: promoting it to `h1` would tell a screen reader that
 * the page is about that one article, and the heading would change every time
 * the newsroom changes its lead.
 */
export default async function HomePage() {
  const bands = await getHomepage()

  return (
    <>
      <h1 className="sr-only">Clasificados Colombia — portada</h1>

      {bands.length > 0 ? (
        <HomepageBands bands={bands} />
      ) : (
        <Container width="reading" className="py-24">
          <EmptyState
            title="Todavía no hay nada publicado"
            message="Cuando la redacción publique su primera pieza aparecerá acá."
          />
        </Container>
      )}
    </>
  )
}
