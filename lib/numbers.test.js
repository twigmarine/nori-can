const { toNumber } = require('./numbers')
const { hexToView } = require('./utilities')

/* globals describe test expect */

describe('toNumber', () => {
  test('uint32', () => {
    expect(toNumber(hexToView('b8caef')))
      .toBe(15715000)
  })
  test('uint16', () => {
    // expect(hexStrBuff('fc46').readUInt16LE(0)).toBe(18172)
    expect(toNumber(hexToView('fc46')))
      .toBe(18172)
    expect(toNumber(hexToView('ffff')))
      .toBe(null)
  })
  test('uint24', () => {
    expect(toNumber(hexToView('14f001'))).toBe(126996)
    expect(toNumber(hexToView('00ee00'))).toBe(60928)
    expect(toNumber(hexToView('ffffff'))).toBe(null)
  })
})
