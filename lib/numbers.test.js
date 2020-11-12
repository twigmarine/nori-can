const { getMaxUint, toNumber } = require('./numbers')
const { hexToView } = require('./utilities')

/* globals describe test expect */

describe('getMaxUint', () => {
  test('4 bits', () => {
    expect(getMaxUint(4)).toBe(15)
  })
})
describe('toNumber', () => {
  test('uint32', () => {
    expect(toNumber(hexToView('b8caef')))
      .toBe(15715000)
  })
  test('unit8', () => {
    expect(toNumber(hexToView('94'))).toBe(148)
    expect(toNumber(hexToView('E8'))).toBe(232)
  })
  test('uint16', () => {
    // expect(hexStrBuff('fc46').readUInt16LE(0)).toBe(18172)
    expect(toNumber(hexToView('fc46'))).toBe(18172)
    expect(toNumber(hexToView('0200'))).toBe(2)
    expect(toNumber(hexToView('200'))).toBe(32)
    expect(toNumber(hexToView('0394'))).toBe(37891)
    expect(toNumber(hexToView('03E8'))).toBe(59395)
    expect(toNumber(hexToView('03E8'))).toBe(59395)
    expect(toNumber(hexToView('05E8'))).toBe(59397)
    expect(toNumber(hexToView('0EE8'))).toBe(59406)
    expect(toNumber(hexToView('394'))).toBe(1081)
  })
  test('uint24', () => {
    expect(toNumber(hexToView('14f001'))).toBe(126996)
    expect(toNumber(hexToView('00ee00'))).toBe(60928)
    expect(toNumber(hexToView('ffffff'))).toBe(null)
    expect(toNumber(hexToView('7F1636'))).toBe(3544703)
    expect(toNumber(hexToView('7F1636'), false, false)).toBe(8328758)
    expect(toNumber(hexToView('7F1A9B'), false, false)).toBe(8329883)
    expect(toNumber(hexToView('7F10A5'), false, false)).toBe(8327333)
  })
})
