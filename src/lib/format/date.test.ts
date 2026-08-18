import { describe, expect, it } from 'vitest'

import {
  formatEditorialDate,
  formatEditorialDateTime,
  parseDate,
  readingTimeMinutes,
  toDateTimeAttribute,
} from './date'

describe('parseDate', () => {
  it('accepts an ISO string and a Date', () => {
    expect(parseDate('2026-08-18T16:30:00.000Z')?.toISOString()).toBe('2026-08-18T16:30:00.000Z')
    expect(parseDate(new Date('2026-08-18T16:30:00.000Z'))?.getTime()).toBe(
      Date.parse('2026-08-18T16:30:00.000Z'),
    )
  })

  it('returns null rather than an Invalid Date', () => {
    expect(parseDate(null)).toBeNull()
    expect(parseDate(undefined)).toBeNull()
    expect(parseDate('')).toBeNull()
    expect(parseDate('ayer')).toBeNull()
  })
})

describe('formatEditorialDate', () => {
  it('formats in Spanish regardless of the server locale', () => {
    expect(formatEditorialDate('2026-08-18T16:30:00.000Z')).toContain('agosto')
    expect(formatEditorialDate('2026-08-18T16:30:00.000Z')).toContain('2026')
  })

  it('renders the Bogotá day, not the UTC day', () => {
    // 2026-08-19T02:30Z is still the 18th in Bogotá (−05:00). A server on UTC
    // would otherwise date the story a day forward.
    expect(formatEditorialDate('2026-08-19T02:30:00.000Z')).toContain('18')
  })

  it('returns null for a missing date instead of a placeholder', () => {
    expect(formatEditorialDate(null)).toBeNull()
    expect(formatEditorialDate('no es fecha')).toBeNull()
  })
})

describe('formatEditorialDateTime', () => {
  it('includes a time', () => {
    const formatted = formatEditorialDateTime('2026-08-18T16:30:00.000Z')

    expect(formatted).toMatch(/\d{1,2}:\d{2}/)
  })

  it('returns null for a missing date', () => {
    expect(formatEditorialDateTime(undefined)).toBeNull()
  })
})

describe('toDateTimeAttribute', () => {
  it('emits the full ISO instant, not the human string', () => {
    expect(toDateTimeAttribute('2026-08-18T16:30:00.000Z')).toBe('2026-08-18T16:30:00.000Z')
  })

  it('returns null when there is nothing to state', () => {
    expect(toDateTimeAttribute(null)).toBeNull()
  })
})

describe('readingTimeMinutes', () => {
  it('rounds to whole minutes', () => {
    expect(readingTimeMinutes(200)).toBe(1)
    expect(readingTimeMinutes(500)).toBe(3)
    expect(readingTimeMinutes(1000)).toBe(5)
  })

  it('never reports zero minutes', () => {
    // "0 min de lectura" reads like a bug, not like a short piece.
    expect(readingTimeMinutes(0)).toBe(1)
    expect(readingTimeMinutes(10)).toBe(1)
    expect(readingTimeMinutes(-5)).toBe(1)
    expect(readingTimeMinutes(Number.NaN)).toBe(1)
  })
})
