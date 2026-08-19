import { describe, expect, it } from 'vitest'

import { collectMediaIds, mediaFieldPaths } from './mediaReferences'

describe('collectMediaIds', () => {
  it('finds an image dropped into a body, however deep', () => {
    const body = {
      root: {
        children: [
          { type: 'paragraph', children: [{ text: 'Un párrafo' }] },
          { type: 'upload', relationTo: 'media', value: 42 },
        ],
      },
    }

    expect(collectMediaIds(body)).toEqual(new Set([42]))
  })

  it('reads the id out of a populated relationship', () => {
    const body = { children: [{ relationTo: 'media', value: { id: 7, alt: 'Retrato' } }] }

    expect(collectMediaIds(body)).toEqual(new Set([7]))
  })

  it('finds every image in a gallery block', () => {
    const body = {
      root: {
        children: [
          {
            type: 'block',
            fields: {
              images: [
                { image: { relationTo: 'media', value: 1 } },
                { image: { relationTo: 'media', value: 2 } },
              ],
            },
          },
          { type: 'upload', relationTo: 'media', value: 3 },
        ],
      },
    }

    expect(collectMediaIds(body)).toEqual(new Set([1, 2, 3]))
  })

  it('ignores relationships to anything else', () => {
    const body = {
      children: [
        { relationTo: 'authors', value: 42 },
        { relationTo: 'evidence-documents', value: 43 },
      ],
    }

    expect(collectMediaIds(body).size).toBe(0)
  })

  it('survives an empty or malformed body without throwing', () => {
    expect(collectMediaIds(null).size).toBe(0)
    expect(collectMediaIds(undefined).size).toBe(0)
    expect(collectMediaIds('texto suelto').size).toBe(0)
    expect(collectMediaIds({ relationTo: 'media' }).size).toBe(0)
  })

  it('does not confuse a media id with an id from another collection', () => {
    const body = {
      children: [
        { relationTo: 'authors', value: 5 },
        { relationTo: 'media', value: 9 },
      ],
    }

    expect(collectMediaIds(body)).toEqual(new Set([9]))
  })
})

describe('mediaFieldPaths', () => {
  it('finds a lead image nested inside a group', () => {
    const fields = [
      { name: 'title', type: 'text' },
      {
        name: 'hero',
        type: 'group',
        fields: [
          { name: 'image', type: 'upload', relationTo: 'media' },
          { name: 'captionOverride', type: 'textarea' },
        ],
      },
    ]

    // The single most-used image on the site lives here. A top-level scan
    // reports it as unreferenced and lets it be deleted.
    expect(mediaFieldPaths(fields)).toEqual(['hero.image'])
  })

  it('finds a plain upload at the top level', () => {
    expect(mediaFieldPaths([{ name: 'poster', type: 'upload', relationTo: 'media' }])).toEqual([
      'poster',
    ])
  })

  it('does not add a level for rows and collapsibles, which only group visually', () => {
    const fields = [
      { type: 'row', fields: [{ name: 'logo', type: 'upload', relationTo: 'media' }] },
      {
        type: 'collapsible',
        fields: [{ name: 'portrait', type: 'upload', relationTo: 'media' }],
      },
    ]

    expect(mediaFieldPaths(fields)).toEqual(['logo', 'portrait'])
  })

  it('follows named and unnamed tabs differently', () => {
    const fields = [
      {
        type: 'tabs',
        tabs: [
          { name: 'seo', fields: [{ name: 'image', type: 'upload', relationTo: 'media' }] },
          { fields: [{ name: 'cover', type: 'upload', relationTo: 'media' }] },
        ],
      },
    ]

    expect(mediaFieldPaths(fields)).toEqual(['seo.image', 'cover'])
  })

  it('accepts a polymorphic relationship that includes media', () => {
    const fields = [{ name: 'attachment', type: 'relationship', relationTo: ['media', 'sources'] }]

    expect(mediaFieldPaths(fields)).toEqual(['attachment'])
  })

  it('ignores relationships to other collections', () => {
    const fields = [
      { name: 'authors', type: 'relationship', relationTo: 'authors' },
      { name: 'category', type: 'relationship', relationTo: 'categories' },
    ]

    expect(mediaFieldPaths(fields)).toEqual([])
  })
})
