import { describe, expect, it } from 'vitest'

import { formatDuration } from './duration'

describe('formatDuration', () => {
  it('formats minutes and seconds with a padded seconds field', () => {
    expect(formatDuration(272)).toBe('4:32')
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(600)).toBe('10:00')
  })

  it('adds an hours field only past the hour', () => {
    expect(formatDuration(3930)).toBe('1:05:30')
    expect(formatDuration(3599)).toBe('59:59')
  })

  it('returns null for a duration that was never recorded', () => {
    // The badge disappears rather than printing "0:00", which reads as a video
    // of no length rather than one of unknown length.
    expect(formatDuration(null)).toBeNull()
    expect(formatDuration(undefined)).toBeNull()
    expect(formatDuration(0)).toBeNull()
    expect(formatDuration(-30)).toBeNull()
    expect(formatDuration(Number.NaN)).toBeNull()
  })

  it('truncates fractional seconds rather than printing them', () => {
    expect(formatDuration(272.9)).toBe('4:32')
  })
})
