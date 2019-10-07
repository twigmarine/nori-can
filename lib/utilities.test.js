// const _ = require('lodash/fp')
const { Int64LE } = require('int64-buffer')

/* globals describe test expect */

const {
  arrBuff, arrayBufferEqual,
  buffArr, buffHexStr, byteString, hexStrBuff, u8Concat,
} = require('./utilities')

describe('arrBuff', () => {
  test('array of 8bit numbers', () => {
    const arr = [2, 16, 32, 128, 240]
    const data = arrBuff(arr)
    expect(data.constructor).toBe(Uint8Array)
    expect(data.byteLength).toBe(5)
    expect(buffArr(data)).toEqual(arr)
    expect(buffHexStr(data, '')).toBe('02102080f0')
  })
})

describe('byteString', () => {
  test('Buffer to string', () => {
    const data = hexStrBuff('00ff7f520021feff')
    expect(byteString(data)).toEqual('00,ff,7f,52,00,21,fe,ff')
  })
})

describe('u8Concat', () => {
  test('Join multiple u8 arrays together', () => {
    const arrays = [
      Uint8Array.from([22, 66, 210]),
      Uint8Array.from([44, 88, 120]),
      Uint8Array.from([6, 9]),
    ]
    const data = u8Concat(arrays)
    expect(data).toEqual(Uint8Array.from([22, 66, 210, 44, 88, 120, 6, 9]))
  })
})
describe('arrayBufferEqual', () => {
  const maxInt32 = 0x7fffffff
  const maxUint32 = 0xffffffff
  const buff1 = Int32Array.from([maxUint32, maxInt32]).buffer
  const buff2 = Uint32Array.from([maxUint32, maxInt32]).buffer
  const buff3 = hexStrBuff('ffffffffffffff7f').buffer
  const buff4 = new Int64LE(maxInt32, maxUint32).toArrayBuffer()
  test('Compare array buffs. return true when same', () => {
    expect(arrayBufferEqual(buff1, buff2)).toBe(true)
    expect(arrayBufferEqual(buff1, buff3)).toBe(true)
    expect(arrayBufferEqual(buff1, buff4)).toBe(true)
  })
})
