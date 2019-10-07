const pgns = require('@canboat/pgns')
const {
  createGetPgn, createGetPgn0, createGetInfo, field2Arr, fixFields,
} = require('./pgns')
/* globals describe test expect */

// console.log(pgns)
describe('getPgn', () => {
  const getPgn = createGetPgn(pgns)
  test('Return info array about a pgn number', () => {
    expect(getPgn('60928')).toBe(undefined)
    expect(getPgn(60928)).toMatchObject([
      { description: 'ISO Address Claim' },
    ])
  })
})
describe('getPgn0', () => {
  test('Return first info object about a pgn number', () => {
    const getPgn0 = createGetPgn0(pgns)
    expect(getPgn0('60928')).toBe(undefined)
    expect(getPgn0(60928)).toMatchObject({ description: 'ISO Address Claim' })
  })
})
describe('createGetInfo', () => {
  test('Return first info object about a pgn number', () => {
    const getInfo = createGetInfo(pgns)
    expect(getInfo({ pgn: 60928 }))
      .toMatchObject({ description: 'ISO Address Claim' })
  })
})
describe('field2Arr', () => {
  test('Turn object with Field prop to an array', () => {
    const field = { foo: 'bar' }
    expect(field2Arr({ field })).toEqual([field])
    expect([{}]).toEqual([{}])
  })
})

describe('fixFields', () => {
  test('Convert Field object to array', () => {
    expect(fixFields({ field: { bytes: 2, foo: 'bar' } })).toEqual([{
      bitLength: 16,
      bitOffset: 0,
      bitStart: 0,
      byteStart: 0,
      byteEnd: 2,
      bytes: 2,
      offset: 0,
      resolution: 1,
      withinByte: false,
      id: ' unknown',
      name: 'Unknown1',
      signed: false,
      foo: 'bar',
    }])
  })
  const fields = [
    { name: 'cat' },
    { name: 'cat' },
    { bitLength: 1, name: 'Reserved' },
    { bitLength: 7, name: 'Reserved' },
  ]
  test('Build out Fields array', () => {
    expect(fixFields(fields)).toEqual([
      {
        bitLength: 8,
        bitOffset: 0,
        bitStart: 0,
        byteStart: 0,
        byteEnd: 1,
        bytes: 1,
        offset: 0,
        resolution: 1,
        withinByte: true,
        id: ' unknown',
        name: 'cat',
        signed: false,
      },
      {
        bitLength: 8,
        bitOffset: 8,
        bitStart: 0,
        byteStart: 1,
        byteEnd: 2,
        bytes: 1,
        offset: 0,
        resolution: 1,
        withinByte: true,
        id: ' unknown',
        name: 'cat1',
        signed: false,
      },
      {
        bitLength: 1,
        bitOffset: 16,
        bitStart: 0,
        byteStart: 2,
        offset: 0,
        resolution: 1,
        withinByte: true,
        id: ' unknown',
        name: 'Reserved1',
        signed: false,
      },
      {
        bitLength: 7,
        bitOffset: 17,
        bitStart: 1,
        byteStart: 2,
        offset: 0,
        resolution: 1,
        withinByte: true,
        id: ' unknown',
        name: 'Reserved2',
        signed: false,
      },
    ])
  })
})
