import Link from 'next/link'

import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/layout/Container'
import { cn } from '@/components/ui/cn'
import { getNavigation, getSiteSettings } from '@/data/site'
import { linkRel } from '@/lib/navigation/links'

/**
 * Site footer (PRD Nº8 §30-§32, PRD SEO §67).
 *
 * On the Ink surface, which is where the brand's dark lockup belongs and where
 * the footer stops competing with the article above it.
 *
 * The contact block is not decoration. PRD SEO §67 asks for real, visible
 * contact details because an investigative outlet with no way to reach it reads
 * as an anonymous entity — to a reader, and to the structured-data consumers
 * that judge publisher legitimacy.
 *
 * Columns come from the `navigation` global (delta D-04 left the exact routes
 * to the client, so the shape is editable rather than fixed in code).
 */
const columnLinkClass = cn(
  'text-[length:var(--text-metadata)] text-[color:var(--color-text-inverse-muted)]',
  'no-underline underline-offset-4 hover:text-[color:var(--color-text-inverse)] hover:underline',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]',
)

export async function SiteFooter() {
  const [{ footer: columns, social }, settings] = await Promise.all([
    getNavigation(),
    getSiteSettings(),
  ])

  const contact = settings.contact
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 bg-[var(--color-surface-inverse)] text-[color:var(--color-text-inverse)]">
      <Container width="wide" className="py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <Logo surface="dark" height={40} />

            {settings.siteDescription ? (
              <p className="mt-6 text-[length:var(--text-metadata)] text-[color:var(--color-text-inverse-muted)]">
                {settings.siteDescription}
              </p>
            ) : null}

            {contact?.email || contact?.phone || contact?.address ? (
              <address className="mt-6 flex flex-col gap-1 text-[length:var(--text-metadata)] text-[color:var(--color-text-inverse-muted)] not-italic">
                {contact.address ? <span>{contact.address}</span> : null}
                {contact.email ? (
                  <a href={`mailto:${contact.email}`} className={columnLinkClass}>
                    {contact.email}
                  </a>
                ) : null}
                {contact.phone ? <span>{contact.phone}</span> : null}
              </address>
            ) : null}
          </div>

          {columns.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-12 gap-y-10 md:grid-cols-3">
              {columns.map((column) => (
                <nav key={column.title} aria-label={column.title}>
                  <h2 className="text-[length:var(--text-label)] tracking-[var(--text-label--letter-spacing)] uppercase">
                    {column.title}
                  </h2>

                  <ul className="mt-4 flex flex-col gap-2">
                    {column.links.map((link) => (
                      <li key={`${link.label}-${link.href}`}>
                        <Link
                          href={link.href}
                          target={link.newTab ? '_blank' : undefined}
                          rel={linkRel(link)}
                          className={columnLinkClass}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-[var(--color-border-inverse)] pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-[length:var(--text-metadata)] text-[color:var(--color-text-inverse-muted)]">
            © {year} {settings.siteName}
          </p>

          {social.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-4">
              {social.map((item) => (
                <li key={item.platform}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={columnLinkClass}
                  >
                    {item.platform}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Container>
    </footer>
  )
}
