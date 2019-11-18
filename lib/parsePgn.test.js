const pgns = require('@canboat/pgns')
const {
  getFieldInfo, parse, parser, splitPgn,
} = require('./parsePgn')
const { parseCanId } = require('./canId')
const { canboatGetInfo, fixPgn, getProprietary } = require('./pgns')
const { arrBuff, hexToBuff } = require('./utilities')
const { parseN2kString } = require('./stringMsg')
// const { getRawFieldValues } = require('./addFields')

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
      byteLength: 1,
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
const getPgnInfo = canboatGetInfo(pgns)

/* globals describe test expect */

const info1 = fixPgn({
  Description: 'Radio Info',
  Fields: [
    { byteLength: 4 },
    { byteLength: 4 },
    { byteLength: 6, isText: true },
    { byteLength: 2 },
    { byteLength: 1 },
    { byteLength: 2 },
  ],
})

const data = hexToBuff('b8caef00b8caef00393030303233ffff00ffff')
const res = splitPgn({ data }, info1)

describe('splitPgn', () => {
  test('Add WithinByte data to fields', () => {
    expect(res.fieldData[0]).toBe(15715000)
    expect(res.fieldData[1]).toBe(15715000)
    expect(res.fieldData[2]).toEqual(new DataView(hexToBuff('393030303233').buffer))
    expect(res.fieldData[3]).toBe(null)
    expect(res.fieldData[4]).toBe(0)
    expect(res.fieldData[5]).toBe(null)
  })
  test('Bit Length fields', () => {
  })
})
describe('getFieldInfo', () => {
  const info = getProprietary({ pgn: 130822 })
  const data2 = hexToBuff('27 99 46 01 00 00 04 00 00 04 00 00 04 00 00 04 00 00 04 00 E8 07 00 E8 07 00 00 04')
  const res2 = getFieldInfo(data2, info)
  test('Add extra binary field', () => {
    expect(res2.length).toBe(4)
    expect(res2[3]).toEqual({
      id: 'unkownData',
      name: 'Unkown Binary Data',
      type: 'Binary data',
      bitLength: 208,
      byteLength: 26,
      position: 3,
      bitOffset: 16,
      bitStart: 0,
      byteStart: 2,
      withinByte: false,
      byteEnd: 28,
    })
  })
})

// [193, 8, 71, 180, 224, 86, 30, 0, 132, 105, 165, 118, 56, 104, 5, 0, 246,
// 60, 224, 176, 90, 0, 160, 0, 64, 242, 255, 255, 0, 255, 255, 255, 255,
// 255, 0, 0, 0, 0, 0, 0, 0, 0, 0]
// 60928 - 00 00 c0 2c 00 aa 46 c0
//  - 00 00 c0 2c 00 aa 46 c0
describe('parse', () => {
  test('dataReady', () => {
    const info = parseCanId(234358146)
    info.data = arrBuff([
      255, 8, 71, 208, 181, 184, 27, 0, 100, 179,
      49, 28, 55, 255, 255, 255, 127, 35, 252,
      11, 81, 0, 255, 127, 255, 255, 255, 127,
      255, 255, 255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    info.dataReady = true

    const result = parse(getPgnInfo, null, info)
    expect(result.src).toBe(130)
    expect(result.info.pgn).toBe(129029)
    expect(result.info.id).toBe('gnssPositionData')
    expect(result.fieldData[0]).toBe(null) // Seq ID. null is invalid.
    expect(result.fieldData[1]).toBe(18184) // Date
  })
  test('ISO Address Claim', () => {
    const info = {
      pgn: 60928,
      data: hexToBuff('00 00 c0 2c 00 aa 46 c0'),
    }
    // 35 / 170 / 4 (100)
    const result = parse(getPgnInfo, null, info)
    expect(result.fieldData[1]).toBe(358)
    expect(result.fieldData[4]).toBe(170)
    expect(result.fieldData[6]).toBe(35)
  })
  test('proprietary', () => {
    const info = {
      pgn: 61184,
      data: hexToBuff('66 99 FF EE 00 00 00 00'),
    }
    const result = parse(getPgnInfo, null, info)
    // console.log(result)
    expect(result.info.id).toBe('victronBatteryRegister')
    expect(result.fieldData[0]).toBe(358)
  })
})

const parseInfo = parser(getPgnInfo)
describe('parser', () => {
  function fromHex(txt) {
    return { pgn: 129029, data: hexToBuff(txt) }
  }
  const p1 = [
    fromHex('002ffffc46103773'), fromHex('011d00d4b2496c37'),
    fromHex('02680500f4329d63'), fromHex('03cb62f5ffffffff'),
    fromHex('04ffffff7f23fc0b'), fromHex('055100ff7fffffff'),
    fromHex('067fffffffffffff'),
  ]
  test('collects fast packet', () => {
    const p1f1 = parseInfo(p1[0])
    // console.log(p1)
    expect(p1f1.seqState).toMatchObject({
      frameCount: 1,
      totalFrames: 7,
      sequenceId: 0,
    })
    const p1f2 = parseInfo(p1[1])
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
    expect(parseInfo(p2[0])).toMatchObject({
      data: hexToBuff('20 2B D1 FC 46 C4 23 77'),
      info: {
        description: 'GNSS Position Data',
        id: 'gnssPositionData',
      },
      pgn: 129029,
      seqState: {
        frames: [hexToBuff('D1 FC 46 C4 23 77')],
        frameCount: 1,
        totalFrames: 7,
        sequenceId: 1,
        totalBytes: 43,
      },
    })
    parseInfo(p2[1])
    parseInfo(p2[2])
    parseInfo(p2[3])
    parseInfo(p2[4])
    parseInfo(p2[5])
    const p1f7 = parseInfo(p2[6])
    expect(p1f7.seqState.totalBytes).toBe(43)
    expect(p1f7.data)
      .toEqual(hexToBuff('d1fc46c4237723004ea610c437680500249cdf7ccc62f5a075e9000000000013fc085a008c0040f2ffff00'))
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
      null, // Reference Station ID"1"
      undefined, // Age of DGNSS Corrections "1"
      // Reference Station Type "n"
      // Reference Station ID "n"
      // Age of DGNSS Reference Station "n"
    ])
  })
  test('added pgn', () => {
    const input = '02:24:06.822 R 0DF1140D 00 0D 00 FF FF FF 7F FD'
    const basicInfo = parseN2kString(input)
    const parsed = parseInfo(basicInfo)
    expect(parsed.info.pgn).toBe(127252)
  })
})

describe('multi proprietary', () => {
  const input = parseCanId(0x1DEFFF83)
  test('Unknown Multi Proprietary 1 of 2', () => {
    const d1 = { ...input, data: hexToBuff('A0 09 3B 9F 8C 0C 03 01') }
    const res1 = parseInfo(d1)
    expect(res1.pgn).toBe(126720)
    expect(res1.info.singleFrame).toBe(false)
    expect(res1.seqState).toEqual({
      frames: [hexToBuff('3B 9F 8C 0C 03 01')],
      frameCount: 1,
      totalFrames: 2,
      sequenceId: 5,
      totalBytes: 9,
    })
  })
})

// createFastPackets
// long [0, 238, 88, 253, 176, 90, 0, 180]
// long [255, 127, 35, 252, 11, 81, 0, 255]
// lat [0, 70, 60, 242, 34, 55, 218, 98]
