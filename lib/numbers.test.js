const { numMap, toNumber } = require('./numbers')
const { hexToBuff } = require('./utilities')

/* globals describe test expect */

describe('toUint24', () => {
  test('Convert 3 bytes to number', () => {
    const toUint24 = numMap.get(3).uint.toNum
    expect(toUint24(new DataView(hexToBuff('14f001').buffer)))
      .toBe(126996)
    expect(toUint24(new DataView(hexToBuff('00ee00').buffer)))
      .toBe(60928)
  })
})
describe('toNumber', () => {
  test('uint32', () => {
    expect(toNumber(new DataView(hexToBuff('b8caef').buffer)))
      .toBe(15715000)
  })
  test('uint16', () => {
    // expect(hexStrBuff('fc46').readUInt16LE(0)).toBe(18172)
    expect(toNumber(new DataView(hexToBuff('fc46').buffer)))
      .toBe(18172)
  })
})
