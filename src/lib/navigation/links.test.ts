import { describe, expect, it } from 'vitest'

import {
  isSafeExternalUrl,
  linkRel,
  resolveNavLink,
  resolveNavLinks,
  sectionPath,
  targetSlug,
} from './links'

describe('targetSlug', () => {
  it('reads the slug off a populated relationship', () => {
    expect(targetSlug({ slug: 'corrupcion' })).toBe('corrupcion')
  })

  it('returns null for an unpopulated relationship', () => {
    // depth 0: Payload hands back the id, not the document.
    expect(targetSlug(42)).toBeNull()
    expect(targetSlug('42')).toBeNull()
  })

  it('returns null for a missing or empty slug', () => {
    expect(targetSlug(null)).toBeNull()
    expect(targetSlug({})).toBeNull()
    expect(targetSlug({ slug: '' })).toBeNull()
  })
})

describe('isSafeExternalUrl', () => {
  it('accepts the three protocols an editor legitimately needs', () => {
    expect(isSafeExternalUrl('https://example.org/x')).toBe(true)
    expect(isSafeExternalUrl('http://example.org')).toBe(true)
    expect(isSafeExternalUrl('mailto:redaccion@example.org')).toBe(true)
  })

  it('rejects javascript: — the stored XSS route React does not block', () => {
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeExternalUrl('JavaScript:alert(1)')).toBe(false)
    expect(isSafeExternalUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
  })

  it('accepts an absolute path', () => {
    expect(isSafeExternalUrl('/quienes-somos')).toBe(true)
  })

  it('rejects a protocol-relative URL', () => {
    // `//evil.example` leaves the site without looking like it does.
    expect(isSafeExternalUrl('//evil.example')).toBe(false)
  })

  it('rejects a bare relative path, which would resolve differently per page', () => {
    expect(isSafeExternalUrl('quienes-somos')).toBe(false)
  })
})

describe('resolveNavLink', () => {
  it('builds a section href from the slug, not from a stored URL', () => {
    expect(
      resolveNavLink({ label: 'Corrupción', linkType: 'internal', category: { slug: 'corrupcion' } }),
    ).toEqual({
      label: 'Corrupción',
      href: sectionPath('corrupcion'),
      newTab: false,
      external: false,
    })
  })

  it('treats a missing linkType as internal', () => {
    expect(resolveNavLink({ label: 'Datos', category: { slug: 'datos' } })?.href).toBe('/seccion/datos')
  })

  it('drops a link whose category was deleted or never populated', () => {
    expect(resolveNavLink({ label: 'Fantasma', linkType: 'internal', category: null })).toBeNull()
    expect(resolveNavLink({ label: 'Fantasma', linkType: 'internal', category: 7 })).toBeNull()
  })

  it('drops a link with no label', () => {
    expect(resolveNavLink({ label: '   ', category: { slug: 'x' } })).toBeNull()
  })

  it('drops an unsafe external URL instead of rendering it', () => {
    expect(resolveNavLink({ label: 'Click', linkType: 'external', url: 'javascript:alert(1)' })).toBeNull()
  })

  it('marks an internal path typed as external as not-external', () => {
    // The protocol is what decides, not the field the editor picked.
    const link = resolveNavLink({ label: 'Nosotros', linkType: 'external', url: '/nosotros' })

    expect(link).toEqual({ label: 'Nosotros', href: '/nosotros', newTab: false, external: false })
  })

  it('carries newTab through', () => {
    expect(
      resolveNavLink({ label: 'X', linkType: 'external', url: 'https://x.example', newTab: true })
        ?.newTab,
    ).toBe(true)
  })
})

describe('resolveNavLinks', () => {
  it('keeps the good ones and silently drops the broken ones', () => {
    const resolved = resolveNavLinks([
      { label: 'Uno', category: { slug: 'uno' } },
      { label: 'Roto', category: null },
      { label: 'Dos', linkType: 'external', url: 'https://dos.example' },
      { label: 'Peligroso', linkType: 'external', url: 'javascript:void 0' },
    ])

    expect(resolved.map((l) => l.label)).toEqual(['Uno', 'Dos'])
  })

  it('handles an empty or absent menu', () => {
    expect(resolveNavLinks(null)).toEqual([])
    expect(resolveNavLinks([])).toEqual([])
  })
})

describe('linkRel', () => {
  it('always adds noopener to a new tab', () => {
    expect(linkRel({ label: 'a', href: '/a', newTab: true, external: false })).toBe('noopener')
  })

  it('adds noreferrer to external links', () => {
    expect(linkRel({ label: 'a', href: 'https://a.example', newTab: true, external: true })).toBe(
      'noopener noreferrer',
    )
  })

  it('leaves an ordinary internal link without a rel', () => {
    expect(linkRel({ label: 'a', href: '/a', newTab: false, external: false })).toBeUndefined()
  })
})
