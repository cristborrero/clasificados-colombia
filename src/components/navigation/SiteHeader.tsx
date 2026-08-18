import Link from 'next/link'
import { Search } from 'lucide-react'

import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/layout/Container'
import { cn } from '@/components/ui/cn'
import { getBreakingNews, getNavigation } from '@/data/site'

import { BreakingNewsBar } from './BreakingNewsBar'
import { MobileNav } from './MobileNav'
import { PrimaryNav } from './PrimaryNav'
import { SkipLink } from './SkipLink'
import { StickyHeader } from './StickyHeader'

/**
 * Site header (PRD Nº8 §25-§31).
 *
 * A Server Component. The navigation is read through the Local API at render
 * time, so an editor changing the menu changes the site — nothing here is
 * hardcoded (PRD Nº8 §28). Only the sticky shell and the mobile dialog cross
 * into the client, and only because scroll state and focus trapping need to.
 *
 * Sticky and compacting on scroll, per §26-§27. The compact state is expressed
 * entirely in these classes, driven by the `data-compact` attribute the shell
 * sets: vertical padding halves and the logo drops from 36px to 28px. Nothing
 * else moves — §26 asks for *"sin animaciones exageradas"*, and a header that
 * rearranges itself while you read is exactly the thing it is warning about.
 *
 * The search trigger is a discreet icon, not a permanent input (§31).
 *
 * A missing `navigation` global renders a header with the logo and nothing
 * else. That is the state of a fresh install, and it has to be deployable
 * before it is configured.
 */
const secondaryLinkClass = cn(
  'text-[length:var(--text-label)] tracking-[var(--text-label--letter-spacing)] uppercase',
  'text-[color:var(--color-text-muted)] no-underline underline-offset-4 hover:underline',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
)

export async function SiteHeader({ currentPath }: { currentPath?: string } = {}) {
  const [{ primary, secondary }, breaking] = await Promise.all([getNavigation(), getBreakingNews()])

  return (
    <>
      <SkipLink />

      {/* Scrolls away with the page. Sticking two bars to the top would take
          the mobile viewport §27 asks us to protect. */}
      <BreakingNewsBar news={breaking?.news ?? null} href={breaking?.href ?? null} />

      <StickyHeader>
        <Container
          width="wide"
          className={cn(
            'flex items-center justify-between gap-6',
            'py-5 transition-[padding] duration-200 motion-reduce:transition-none',
            'group-data-[compact=true]:py-2',
          )}
        >
          <Link
            href="/"
            aria-label="Clasificados Colombia — portada"
            className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)]"
          >
            <Logo
              variant="responsive"
              surface="light"
              imageClassName={cn(
                'h-9 w-auto transition-[height] duration-200 motion-reduce:transition-none',
                'group-data-[compact=true]:h-7',
              )}
            />
          </Link>

          <PrimaryNav links={primary} currentPath={currentPath} />

          <div className="flex items-center gap-1">
            {secondary.length > 0 ? (
              <ul className="hidden items-center gap-4 lg:flex">
                {secondary.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <Link href={link.href} className={secondaryLinkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            {/*
              Links to a real page rather than opening a dialog. The SearchDialog
              is F14 (PRD Nº8 §32); a control that opens nothing is worse than a
              link that works, and /buscar has to exist anyway for readers
              arriving from a search engine.

              44px minimum target (PRD Nº8, DoD F8): p-3 on a 20px icon is 44px.
            */}
            <Link
              href="/buscar"
              className={cn(
                'inline-flex items-center justify-center p-3',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
              )}
            >
              <Search aria-hidden size={20} strokeWidth={1.75} />
              <span className="sr-only">Buscar</span>
            </Link>

            <MobileNav links={primary} secondary={secondary} />
          </div>
        </Container>
      </StickyHeader>
    </>
  )
}
