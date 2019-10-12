const pgns = require('@canboat/pgns')
const { parser, splitPgn, toNumber } = require('./parsePgn')
const { createGetInfo, fixPgn } = require('./pgns')
const { hexStrBuff, hexSpStrBuff } = require('./utilities')
const { parseN2kString } = require('./stringMsg')

// Add in a pgn.
pgns.PGNs.push({
  pgn: 127252,
  id: 'heave',
  name: 'Heave',
  description: 'Vertical displacement perpendicular to (smooth, wave-free water on) the earth’s surface.',
  fields: [
    {
      id: 'sequenceId',
      name: 'Sequence Id',
      bytes: 1,
      type: 'Integer',
    },
    {
      id: 'heave',
      name: 'Heave',
    },
    {
      id: 'delay',
      name: 'Delay',
    },
    {
      id: 'delaySource',
      name: 'Delay Source',
    },
    {
      id: 'reserved',
    },
  ],
})
const getPgnInfo = createGetInfo(pgns)

/* globals describe test expect */

const info = fixPgn({
  Description: 'Radio Info',
  Fields: [
    { Bytes: 4 },
    { Bytes: 4 },
    { Bytes: 6 },
    { Bytes: 2 },
    { Bytes: 1 },
    { Bytes: 2 },
  ],
})
const data = hexStrBuff('b8caef00b8caef00393030303233ffff00ffff')
const res = splitPgn({ data, info })

describe('splitPgn', () => {
  test('Add WithinByte data to fields', () => {
    expect(res[0]).toBe(15715000)
    expect(res[1]).toBe(15715000)
    expect(res[2]).toEqual(new DataView(hexStrBuff('393030303233').buffer))
    expect(res[3]).toBe(null)
    expect(res[4]).toBe(0)
    expect(res[5]).toBe(null)
  })
  // test('Bit Length fields', () => {
  // })
})

describe('toNumber', () => {
  test('uint32', () => {
    expect(toNumber(res[0])).toBe(15715000)
  })
  test('uint16', () => {
    // expect(hexStrBuff('fc46').readUInt16LE(0)).toBe(18172)
    expect(toNumber(new DataView(hexStrBuff('fc46').buffer))).toBe(18172)
  })
})

function fromHex(txt) {
  return { pgn: 129029, data: hexStrBuff(txt.split(' ').join('')) }
}

describe('parser', () => {
  const parse = parser(getPgnInfo)
  const p1 = [
    fromHex('002ffffc46103773'), fromHex('011d00d4b2496c37'),
    fromHex('02680500f4329d63'), fromHex('03cb62f5ffffffff'),
    fromHex('04ffffff7f23fc0b'), fromHex('055100ff7fffffff'),
    fromHex('067fffffffffffff'),
  ]
  test('collects fast packet', () => {
    const p1f1 = parse(p1[0])
    // console.log(p1)
    expect(p1f1.seqState).toMatchObject({
      frameCount: 1,
      totalFrames: 7,
      sequenceId: 0,
    })
    const p1f2 = parse(p1[1])
    // console.log(p1f2)
    expect(p1f2.seqState.frameCount).toBe(2)
  })
  const p2 = [
    fromHex('20 2B D1 FC 46 C4 23 77'), fromHex('21 23 00 4E A6 10 C4 37'),
    fromHex('22 68 05 00 24 9C DF 7C'), fromHex('23 CC 62 F5 A0 75 E9 00'),
    fromHex('24 00 00 00 00 13 FC 08'), fromHex('25 5A 00 8C 00 40 F2 FF'),
    fromHex('26 FF 00 FF FF FF FF FF'),
  ]

  test('process data on complete multi', () => {
    expect(parse(p2[0])).toMatchObject({
      data: hexSpStrBuff('20 2B D1 FC 46 C4 23 77', ' '),
      info: {
        description: 'GNSS Position Data',
        id: 'gnssPositionData',
      },
      pgn: 129029,
      seqState: {
        frames: [hexSpStrBuff('D1 FC 46 C4 23 77', ' ')],
        frameCount: 1,
        totalFrames: 7,
        sequenceId: 1,
        totalBytes: 43,
      },
    })
    parse(p2[1])
    parse(p2[2])
    parse(p2[3])
    parse(p2[4])
    parse(p2[5])
    const p1f7 = parse(p2[6])
    expect(p1f7.seqState.totalBytes).toBe(43)
    expect(p1f7.data)
      .toEqual(hexStrBuff('d1fc46c4237723004ea610c437680500249cdf7ccc62f5a075e9000000000013fc085a008c0040f2ffff00'))
    expect(p1f7.fieldData).toEqual([
      209, // SID
      18172, // days
      59501.05, // seconds into day
      38.9622683, // Latitude 00,4e,a6,10,c4,37,68,05
      -76.482415, // Longitude 00,24,9c,df,7c,cc,62,f5
      15.3, // Altitude a075e90000000000
      // 13
      3, // Type of System GPS+SBAS/WAAS
      1, // Method GNSS fix
      // fc
      0, // Integrity = No integrity checking;
      63, // Reserved 0b111111
      8, // Number of SVs
      0.9, // HDOP
      1.4, // PDOP
      -35.2, // Geoidal Sep
      0, // Number of Reference Stations
      0, // Reference Station Type"1"
      0, // Reference Station ID"1"
      0, // Age of DGNSS Corrections "1"
      // Reference Station Type "n"
      // Reference Station ID "n"
      // Age of DGNSS Reference Station "n"
    ])
  })
  test('added pgn', () => {
    const input = '02:24:06.822 R 0DF1140D 00 0D 00 FF FF FF 7F FD'
    const basicInfo = parseN2kString(input)
    const parsed = parse(basicInfo)
    expect(parsed.info.pgn).toBe(127252)
  })
})

// createFastPackets
