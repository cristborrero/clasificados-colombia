import { describe, expect, it } from 'vitest'

import { parseTipSubmission } from './submission'

const valid = {
  title: 'Contratos sin licitación en la alcaldía',
  description: 'Vi documentos que muestran adjudicaciones directas durante todo el año pasado.',
}

describe('parseTipSubmission', () => {
  it('accepts a minimal submission', () => {
    const result = parseTipSubmission(valid)

    expect(result.ok).toBe(true)
  })

  it('keeps contact details when the sender gave them', () => {
    const result = parseTipSubmission({
      ...valid,
      contactName: 'Ana',
      contactEmail: 'ana@example.org',
      contactPhone: '3001234567',
    })

    expect(result.ok && result.data.contactName).toBe('Ana')
    expect(result.ok && result.data.contactEmail).toBe('ana@example.org')
  })

  /**
   * The assertion this module exists for. Anonymity has to be enforced in the
   * data, before anything reaches the database — a field that is never written
   * cannot leak, be subpoenaed, or appear in an export.
   */
  describe('anonymity', () => {
    it('drops every contact field when anonymity is requested', () => {
      const result = parseTipSubmission({
        ...valid,
        anonymous: true,
        contactName: 'Ana',
        contactEmail: 'ana@example.org',
        contactPhone: '3001234567',
      })

      expect(result.ok).toBe(true)

      if (!result.ok) return

      expect(result.data.contactName).toBeNull()
      expect(result.data.contactEmail).toBeNull()
      expect(result.data.contactPhone).toBeNull()
    })

    it('drops them however the checkbox arrived on the wire', () => {
      // An HTML checkbox posts "on"; JSON posts true. Both mean the same thing,
      // and getting this wrong stores the contact details of someone who asked
      // to be anonymous.
      for (const anonymous of [true, 'true', 'on', 1]) {
        const result = parseTipSubmission({ ...valid, anonymous, contactEmail: 'ana@example.org' })

        expect(result.ok, String(anonymous)).toBe(true)
        expect(result.ok && result.data.contactEmail, String(anonymous)).toBeNull()
      }
    })

    it('keeps contact details when anonymity was not requested', () => {
      for (const anonymous of [false, undefined]) {
        const result = parseTipSubmission({ ...valid, anonymous, contactEmail: 'ana@example.org' })

        expect(result.ok && result.data.contactEmail).toBe('ana@example.org')
      }
    })
  })

  it('normalises empty strings to null rather than storing blanks', () => {
    const result = parseTipSubmission({ ...valid, location: '   ', contactName: '' })

    expect(result.ok && result.data.location).toBeNull()
    expect(result.ok && result.data.contactName).toBeNull()
  })

  it('rejects a submission with nothing in it', () => {
    const result = parseTipSubmission({ title: 'x', description: 'corto' })

    expect(result.ok).toBe(false)
    expect(!result.ok && result.errors.title).toBeTruthy()
    expect(!result.ok && result.errors.description).toBeTruthy()
  })

  it('rejects an oversized submission', () => {
    const result = parseTipSubmission({ ...valid, description: 'x'.repeat(10_001) })

    expect(result.ok).toBe(false)
  })

  it('never echoes the submitted value back in an error', () => {
    // An error message is not a place to reflect user input.
    const result = parseTipSubmission({ ...valid, contactEmail: '<script>alert(1)</script>' })

    expect(result.ok).toBe(false)
    expect(!result.ok && JSON.stringify(result.errors)).not.toContain('script')
  })
})
