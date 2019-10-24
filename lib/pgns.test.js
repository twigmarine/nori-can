const pgns = require('@canboat/pgns')
const {
  canboatGetInfo,
  field2Arr, fixFields, fixPgn, getProprietary,
} = require('./pgns')
/* globals describe test expect */

const getInfo = canboatGetInfo(pgns)

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
      proprietary: false,
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
          byteLength: 2,
          byteStart: 0,
          withinByte: false,
          byteEnd: 2,
        },
      ],
      complete: false,
      byteLength: 2,
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
  test('Add match and matchFields', () => {
    const pgn2 = {
      pgn: 126720,
      fields: [
        {
          id: 'manufacturerCode',
          bitLength: 11,
          match: 419,
        },
        {
          id: 'reserved',
          bitLength: 2,
        },
        {
          id: 'industryCode',
          bitLength: 3,
          match: 4,
        },
        {
          id: 'proprietaryId',
          bitLength: 8,
        },
      ],
    }
    expect(fixPgn(pgn2)).toMatchObject({
      pgn: 126720,
      byteLength: 3,
      complete: false,
      matchFields: ['manufacturerCode', 'industryCode'],
      match: {
        manufacturerCode: 419,
        industryCode: 4,
      },
    })
  })
})
// console.log(pgns)

describe('createGetInfo', () => {
  test('Return first info object about a pgn number', () => {
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
    expect(fixFields({ field: { byteLength: 2, foo: 'bar' } })).toEqual([{
      bitLength: 16,
      bitOffset: 0,
      bitStart: 0,
      byteStart: 0,
      byteEnd: 2,
      byteLength: 2,
      offset: 0,
      order: 1,
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
        byteLength: 1,
        offset: 0,
        order: 1,
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
        byteLength: 1,
        offset: 0,
        order: 2,
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
        order: 3,
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
        order: 4,
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
    expect(getProprietary({ pgn: 65280 }))
      .toEqual({
        pgn: 65280,
        complete: false,
        id: 'UnknownProprietary',
        description: 'Unknown Proprietary',
        proprietary: true,
        fields: [
          {
            id: 'manufacturerCode',
            name: 'Manufacturer Code',
            bitLength: 11,
            type: 'Manufacturer code',
            bitStart: 0,
            signed: false,
            resolution: 1,
            offset: 0,
            order: 1,
            bitOffset: 0,
            byteStart: 0,
            withinByte: false,
          },
          {
            id: 'reserved',
            name: 'Reserved1',
            bitLength: 2,
            bitStart: 3,
            signed: false,
            resolution: 1,
            offset: 0,
            order: 2,
            bitOffset: 11,
            byteStart: 1,
            withinByte: true,
          },
          {
            id: 'industryCode',
            name: 'Industry Group',
            bitLength: 3,
            enumValues: new Map([
              [0, 'Global'],
              [1, 'Highway'],
              [2, 'Agriculture'],
              [3, 'Construction'],
              [4, 'Marine'],
              [5, 'Industrial'],
            ]),
            bitStart: 5,
            signed: false,
            resolution: 1,
            offset: 0,
            order: 3,
            bitOffset: 13,
            byteStart: 1,
            withinByte: true,
          },
          {
            id: 'data',
            name: 'Binary Data',
            byteLength: 6,
            bitLength: 48,
            bitStart: 0,
            signed: false,
            resolution: 1,
            offset: 0,
            order: 4,
            bitOffset: 16,
            byteStart: 2,
            withinByte: false,
            byteEnd: 8,
          },
        ],
        repeatingFields: 0,
        byteLength: 8,
        singleFrame: true,
        variableLength: false,
        matchFields: undefined,
        multiFrame: false,
      })
  })
})
describe('prepMatchOptions', () => {
  test('multi options', () => {
    const pgnInfo = getInfo({ pgn: 126720 })
    const isOptMatch = pgnInfo.options[0].isMatch
    // console.log(pgnInfo.options)
    expect(typeof isOptMatch).toBe('function')
    const fieldData = [1851, 1, 4, 33264, 134, 2, 3]
    expect(isOptMatch(fieldData)).toBe(true)
    expect(pgnInfo.options[1].isMatch(fieldData)).toBe(false)
  })
})
