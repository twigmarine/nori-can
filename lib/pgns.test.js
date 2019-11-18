const pgns = require('@canboat/pgns')
const {
  addPriority, canboatGetInfo,
  field2Arr, fixFields, fixPgn, getPriority, isSingle, getProprietary,
} = require('./pgns')
/* globals describe test expect */

const getInfo = canboatGetInfo(pgns)

describe('fixPgn', () => {
  const pgn = {
    PGN: 126998,
    category: 'General & or Mandatory',
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
      pgnHex: '1F016',
      proprietary: false,
      category: 'General & or Mandatory',
      priority: 6,
      fields: [
        {
          position: 0,
          id: 'installationDescription1',
          name: 'Installation Description #1',
          bitLength: 16,
          bitOffset: 0,
          bitStart: 0,
          type: 'ASCII or UNICODE string starting with length and control byte',
          isText: true,
          signed: false,
          byteLength: 2,
          byteStart: 0,
          withinByte: false,
          byteEnd: 2,
        },
      ],
      complete: false,
      byteLength: 2,
      repeatingFields: 0,
      singleFrame: false,
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
      matchFields: [
        {
          id: 'manufacturerCode',
          match: 419,
          position: 0,
        },
        {
          id: 'industryCode',
          match: 4,
          position: 2,
        },
      ],
      match: {
        manufacturerCode: 419,
        industryCode: 4,
      },
    })
  })
})
// console.log(pgns)
describe('getPriority', () => {
  test('Return correct or default priority number', () => {
    expect(getPriority({})).toBe(7)
    expect(getPriority({ category: 'General & or Mandatory' })).toBe(6)
  })
})
describe('addPriority', () => {
  test('Return correct or default priority number', () => {
    expect(addPriority({})).toEqual({ priority: 7 })
    expect(addPriority({ category: 'General & or Mandatory' })).toEqual({
      category: 'General & or Mandatory',
      priority: 6,
    })
  })
})

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
describe('isSingle', () => {
  test('Check if it is single sized', () => {
    expect(isSingle({ complete: true, singleFrame: true })).toBe(true)
    expect(isSingle({ complete: true, singleFrame: false })).toBe(false)
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
      position: 0,
      withinByte: false,
      id: 'unknown',
      name: 'Unknown',
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
        position: 0,
        withinByte: true,
        id: 'cat',
        name: 'Cat',
        signed: false,
      },
      {
        bitLength: 8,
        bitOffset: 8,
        bitStart: 0,
        byteStart: 1,
        byteEnd: 2,
        byteLength: 1,
        position: 1,
        withinByte: true,
        id: 'cat1',
        name: 'Cat',
        signed: false,
      },
      {
        bitLength: 1,
        bitOffset: 16,
        bitStart: 0,
        byteStart: 2,
        position: 2,
        withinByte: true,
        id: 'reserved',
        name: 'Reserved',
        signed: false,
      },
      {
        bitLength: 7,
        bitOffset: 17,
        bitStart: 1,
        byteStart: 2,
        position: 3,
        withinByte: true,
        id: 'reserved1',
        name: 'Reserved',
        signed: false,
      },
    ])
  })
})
describe('getProprietary', () => {
  test('Test unknown pgn', () => {
    const res = getProprietary({ pgn: 65280 })
    expect(res)
      .toEqual({
        pgn: 65280,
        pgnHex: 'FF00',
        complete: false,
        id: 'UnknownProprietary',
        description: 'Unknown Proprietary',
        name: 'Unknown Proprietary',
        category: 'Proprietary',
        proprietary: true,
        uniqueOn: [],
        priority: 7,
        fields: [
          {
            id: 'manufacturerCode',
            name: 'Manufacturer Code',
            bitLength: 11,
            type: 'Manufacturer code',
            bitStart: 0,
            signed: false,
            position: 0,
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
            position: 1,
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
            position: 2,
            bitOffset: 13,
            byteStart: 1,
            withinByte: true,
          },
        ],
        repeatingFields: 0,
        byteLength: 2,
        singleFrame: true,
        variableLength: false,
        matchFields: undefined,
        multiFrame: false,
      })
    expect(res.fields[2].enumValues.get(0)).toBe('Global')
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
