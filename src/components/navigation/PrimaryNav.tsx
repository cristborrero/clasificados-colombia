import { cn } from '@/components/ui/cn'
import type { ResolvedLink } from '@/lib/navigation/links'

import { NavLink } from './NavLink'

/**
 * Desktop section navigation (PRD Nº8 §11, §28).
 *
 * One row, no mega-menu. PRD Nº8 §11 is explicit about it, and the reasoning is
 * editorial rather than visual: if the sections do not fit on one line, the
 * problem is the section taxonomy, not the header.
 *
 * Hidden below `lg`, where `MobileNav` takes over. Both render the same
 * resolved links, so the two menus cannot drift apart.
 */
export type PrimaryNavProps = {
  links: readonly ResolvedLink[]
  currentPath?: string
  className?: string
}

export function PrimaryNav({ links, currentPath, className }: PrimaryNavProps) {
  if (links.length === 0) return null

  return (
    <nav aria-label="Secciones" className={cn('hidden lg:block', className)}>
      <ul className="flex items-center gap-6">
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <NavLink
              link={link}
              current={currentPath === link.href}
              className="text-[length:var(--text-metadata)] tracking-[0.06em] uppercase"
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
