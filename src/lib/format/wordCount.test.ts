import { describe, expect, it } from 'vitest'

import { countWords } from './wordCount'

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ type: 'text', text }],
})

describe('countWords', () => {
  it('counts the words in a body', () => {
    expect(countWords({ root: { children: [paragraph('uno dos tres')] } })).toBe(3)
  })

  it('adds up across paragraphs', () => {
    expect(
      countWords({ root: { children: [paragraph('uno dos'), paragraph('tres cuatro cinco')] } }),
    ).toBe(5)
  })

  it('descends into nested nodes', () => {
    expect(
      countWords({
        root: {
          children: [
            {
              type: 'list',
              children: [
                { type: 'listitem', children: [{ type: 'text', text: 'uno dos' }] },
                { type: 'listitem', children: [{ type: 'text', text: 'tres' }] },
              ],
            },
          ],
        },
      }),
    ).toBe(3)
  })

  it('skips blocks, which are not prose read at reading speed', () => {
    // A fact box's labels and an image caption are not sentences the reader
    // reads through; counting them inflates the estimate on exactly the
    // articles that have the most of them.
    expect(
      countWords({
        root: {
          children: [
            paragraph('uno dos'),
            { type: 'block', fields: { title: 'no cuenta esto tampoco aquello' } },
          ],
        },
      }),
    ).toBe(2)
  })

  it('ignores whitespace rather than counting it as words', () => {
    expect(countWords({ root: { children: [paragraph('  uno   dos  ')] } })).toBe(2)
    expect(countWords({ root: { children: [paragraph('   ')] } })).toBe(0)
  })

  it('returns zero for an empty or absent body', () => {
    expect(countWords(null)).toBe(0)
    expect(countWords(undefined)).toBe(0)
    expect(countWords({})).toBe(0)
    expect(countWords({ root: { children: [] } })).toBe(0)
  })
})
