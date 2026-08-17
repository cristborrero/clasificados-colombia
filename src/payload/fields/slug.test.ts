import { describe, expect, it } from 'vitest'

import { slugify } from './slug'

describe('slugify', () => {
  it('produces the example from PRD SEO §14', () => {
    expect(slugify('Red de contratos ministerio')).toBe('red-de-contratos-ministerio')
  })

  it('strips Spanish accents instead of dropping the letter', () => {
    expect(slugify('Fiscalía')).toBe('fiscalia')
    expect(slugify('Bogotá')).toBe('bogota')
    expect(slugify('Medellín')).toBe('medellin')
    expect(slugify('Cúcuta')).toBe('cucuta')
    expect(slugify('reforma pensión')).toBe('reforma-pension')
  })

  it('turns ñ into n rather than losing it', () => {
    // "Cañón" losing its ñ would become "caon", which is not a word.
    expect(slugify('Cañón del Chicamocha')).toBe('canon-del-chicamocha')
    expect(slugify('Año electoral')).toBe('ano-electoral')
  })

  it('removes inverted punctuation without leaving separators behind', () => {
    // Half the headlines in this product open with ¿ or ¡.
    expect(slugify('¿Por qué la economía creció menos?')).toBe('por-que-la-economia-crecio-menos')
    expect(slugify('¡Urgente!')).toBe('urgente')
  })

  it('collapses runs of separators', () => {
    expect(slugify('contratos   —   ministerio')).toBe('contratos-ministerio')
    expect(slugify('a // b')).toBe('a-b')
  })

  it('trims leading and trailing separators', () => {
    expect(slugify('  ¿contratos?  ')).toBe('contratos')
    expect(slugify('---hola---')).toBe('hola')
  })

  it('keeps digits, which appear in real document references', () => {
    expect(slugify('Contrato No. 2021-087')).toBe('contrato-no-2021-087')
  })

  it('lowercases', () => {
    expect(slugify('LA VERDAD NO SE NEGOCIA')).toBe('la-verdad-no-se-negocia')
  })

  it('is idempotent — slugifying a slug changes nothing', () => {
    const once = slugify('¿Por qué la Fiscalía allanó oficinas?')
    expect(slugify(once)).toBe(once)
  })

  it('returns an empty string when there is nothing to slug', () => {
    expect(slugify('')).toBe('')
    expect(slugify('¿¡—!?')).toBe('')
  })

  it('handles a full editorial headline', () => {
    expect(slugify('Red de contratos millonarios salpica a funcionarios del Gobierno')).toBe(
      'red-de-contratos-millonarios-salpica-a-funcionarios-del-gobierno',
    )
  })
})
