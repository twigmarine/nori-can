const pgns = require('@canboat/pgns')
const {
  createGetPgn, createGetPgn0, createGetInfo,
  field2Arr, fixFields, fixPgn, getProprietary,
} = require('./pgns')
/* globals describe test expect */

describe('fixPgn', () => {
  const pgn = {
    PGN: 126998,
    Fields: [
      {
        Order: 1,
        Id: 'installationDescription1',
        Name: 'Installation Description #1',
        BitLength: 16,
        BitOffset: 0,
        BitStart: 0,
        Type: 'ASCII or UNICODE string starting with length and control byte',
      },
    ],
  }
  test('Cleanup PGN and variable', () => {
    expect(fixPgn(pgn)).toEqual({
      pgn: 126998,
      fields: [
        {
          order: 1,
          id: 'installationDescription1',
          name: 'Installation Description #1',
          bitLength: 16,
          bitOffset: 0,
          bitStart: 0,
          type: 'ASCII or UNICODE string starting with length and control byte',
          isText: true,
          signed: false,
          resolution: 1,
          offset: 0,
          bytes: 2,
          byteStart: 0,
          withinByte: false,
          byteEnd: 2,
        },
      ],
      complete: false,
      length: 8,
      repeatingFields: 0,
      singleFrame: true,
      variableLength: true,
    })
  })
  test('Cleanup PGN and variable', () => {
    pgn.Fields[0].type = 'foo'
    expect(fixPgn(pgn)).toMatchObject({
      pgn: 126998,
      complete: false,
      variableLength: false,
    })
  })
})
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
describe('getProprietary', () => {
  test('Test unknown pgn', () => {
    expect(getProprietary({ pgn: 123 }))
      .toEqual({
        pgn: 123,
        complete: false,
        id: 'UnknownProprietary',
        description: 'Unknown Proprietary',
        multiFrame: false,
        singleFrame: false,
      })
  })
})
