import { describe, expect, it } from 'vitest'

import { cn } from './cn'

describe('cn', () => {
  it('joins truthy values', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops the falsy results of conditionals', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('flattens nested arrays', () => {
    expect(cn('a', ['b', ['c', 'd']])).toBe('a b c d')
  })

  it('keeps a literal zero, which is a valid class in Tailwind', () => {
    expect(cn(0, 'a')).toBe('0 a')
  })

  it('returns an empty string when nothing applies', () => {
    expect(cn(false, null, undefined)).toBe('')
  })
})
