const { decode } = require('base64-arraybuffer')
const {
  encodeActisense, encodeYDRAW, parseActisense, parseCandump1,
  parsePCDIN, parsePDGY, parseN2kString, parsePDGYdebug, parseYDRAW,
  parseString,
} = require('./stringMsg')
const { arrBuff, byteString, hexToBuff } = require('./utilities')

/* globals describe test expect */

describe('parseCandump1', () => {
  test('basic messages', () => {
    const msg = '<0x18eeff01> [8] 05 a0 be 1c 00 a0 a0 c0'
    expect(parseCandump1(msg)).toEqual({
      canId: 0x18eeff01,
      data: hexToBuff('05 a0 be 1c 00 a0 a0 c0'),
      dst: 255,
      format: 'candump1',
      input: '<0x18eeff01> [8] 05 a0 be 1c 00 a0 a0 c0',
      len: 8,
      src: 1,
      pgn: 60928,
      prio: 6,
    })
    const msg2 = '<0x18ea2301> [3] 14 f0 01'
    expect(parseCandump1(msg2)).toEqual({
      canId: 0x18ea2301,
      data: hexToBuff('14 f0 01'),
      dst: 35,
      format: 'candump1',
      input: '<0x18ea2301> [3] 14 f0 01',
      len: 3,
      src: 1,
      pgn: 59904,
      prio: 6,
    })
  })
})

describe('parseActisense', () => {
  test('basic msg', () => {
    const msg = '2016-04-09T16:41:09.078Z,3,127257,17,255,8,00,ff,7f,52,00,21,fe,ff'
    expect(parseActisense(msg)).toEqual({
      canId: 233904401,
      data: hexToBuff('00,ff,7f,52,00,21,fe,ff'),
      dst: 255,
      len: 8,
      format: 'Actisense',
      input: '2016-04-09T16:41:09.078Z,3,127257,17,255,8,00,ff,7f,52,00,21,fe,ff',
      pgn: 127257,
      prio: 3,
      src: 17,
      timestamp: '2016-04-09T16:41:09.078Z',
      dataReady: true,
    })
  })
})
describe('encodeActisense', () => {
  test('basic msg', () => {
    const msg = '2016-04-09T16:41:09.078Z,3,127257,17,255,8,00,FF,7F,52,00,21,FE,FF'
    const n2k = parseActisense(msg)
    const res = encodeActisense(n2k)
    expect(res).toEqual(msg)
  })
})

const pdgyLong = '!PDGY,129029,3,2,255,483.236,UZ9FfR+bI/////////9//////////3//////////fwD8AIgTiBMAAAAAAQAAAAA'
describe('parsePDGY', () => {
  test('basic msg', () => {
    const msg = '!PDGY,126992,3,2,255,0.563,d2009e45b3b8821d'
    expect(parsePDGY(msg)).toEqual({
      canId: 233836546,
      data: decode('d2009e45b3b8821d'),
      dst: 255,
      format: 'PDGY',
      prefix: '!PDGY',
      input: '!PDGY,126992,3,2,255,0.563,d2009e45b3b8821d',
      pgn: 126992,
      prio: 3,
      src: 2,
      timer: 0.563,
      dataReady: true,
    })
  })
  test('long msg', () => {
    expect(parsePDGY(pdgyLong)).toEqual({
      canId: 234358018,
      data: decode('UZ9FfR+bI/////////9//////////3//////////fwD8AIgTiBMAAAAAAQAAAAA'),
      dst: 255,
      format: 'PDGY',
      prefix: '!PDGY',
      input: pdgyLong,
      pgn: 129029,
      prio: 3,
      src: 2,
      timer: 483.236,
      dataReady: true,
    })
  })
})
describe('parsePDGYdebug', () => {
  test('basic msg', () => {
    const msg = '$PDGY,000000,4,,5,482,1,0'
    expect(parsePDGYdebug(msg)).toEqual({
      canId: 201326849,
      data: arrBuff([4, 0, 5, 482, 1, 0]),
      dst: 1,
      format: 'PDGYdebug',
      prefix: '$PDGY',
      input: '$PDGY,000000,4,,5,482,1,0',
      pgn: 0,
      prio: 3,
      src: 1,
      fields: {
        busLoad: 4,
        deviceCount: 5,
        errors: 0,
        gatewaySrc: 1,
        rejectedTX: 0,
        timer: 482,
      },
    })
  })
})

describe('parsePCDIN', () => {
  test('basic msg', () => {
    const msg = '$PCDIN,01F119,00000000,0F,2AAF00D1067414FF*59'
    expect(parsePCDIN(msg)).toEqual({
      canId: 435230991,
      data: hexToBuff('2AAF00D1067414FF'),
      dst: 255,
      format: 'PCDIN',
      prefix: '$PCDIN',
      input: msg,
      pgn: 127257,
      prio: 0,
      src: 15,
      timer: 1262304000000,
      timestamp: new Date('2010-01-01T00:00:00.000Z'),
    })
  })
})

describe('parseYDRAW', () => {
  test('basic msg', () => {
    const msg = '16:29:27.082 R 09F8017F 50 C3 B8 13 47 D8 2B C6'
    expect(parseYDRAW(msg)).toEqual({
      canId: 0x09F8017F,
      data: hexToBuff('50 C3 B8 13 47 D8 2B C6'),
      direction: 'R',
      dst: 255,
      format: 'YDRAW',
      input: msg,
      pgn: 129025,
      prio: 2,
      src: 127,
      time: '16:29:27.082',
    })
    const msg2 = '02:35:30.110 R 11F80F03 E0 1A 12 AC B0 E7 15 B2'
    expect(parseN2kString(msg2)).toEqual({
      canId: 301469443,
      data: hexToBuff('E0 1A 12 AC B0 E7 15 B2'),
      direction: 'R',
      dst: 255,
      format: 'YDRAW',
      input: msg2,
      pgn: 129039,
      prio: 4,
      src: 3,
      time: '02:35:30.110',
    })
  })
})
describe('encodeYDRAW', () => {
  test('long msg', () => {
    expect(encodeYDRAW(parsePDGY(pdgyLong), 2)).toEqual([
      '0DF80502 40 2F 51 9F 45 7D 1F 9B\r\n',
      '0DF80502 41 23 FF FF FF FF FF FF\r\n',
      '0DF80502 42 FF 7F FF FF FF FF FF\r\n',
      '0DF80502 43 FF FF 7F FF FF FF FF\r\n',
      '0DF80502 44 FF FF FF 7F 00 FC 00\r\n',
      '0DF80502 45 88 13 88 13 00 00 00\r\n',
      '0DF80502 46 00 01 00 00 00 00 FF\r\n',
    ])
  })
})
describe('parseN2kString', () => {
  test('empty string or not string', () => {
    const emptyMsg = 'Input not string or empty.'
    expect(parseN2kString('').error.message).toBe(emptyMsg)
    expect(parseN2kString('').input).toBe('')
    expect(parseN2kString(5).error.message).toBe(emptyMsg)
    expect(parseN2kString(5).input).toBe(5)
  })
  test('parser not found', () => {
    const errMsg = {
      error: new Error('Parser not found for input. - foo,bar'),
      input: 'foo,bar',
      format: 'MISSING_PARSER',
    }
    expect(parseN2kString('foo,bar')).toEqual(errMsg)
  })
})
describe('parseString', () => {
  test('basic msg', () => {
    const msg = '00,FF,7F,52,00,21,FE,FF'
    const res = parseString(msg)
    expect(res.input).toBe(msg)
    expect(byteString(res.data)).toBe(msg)
  })
})
