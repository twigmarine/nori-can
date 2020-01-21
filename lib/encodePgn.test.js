const pgns = require('nori-pgns')
const { byteString, createGetInfo, encodeYDRAW } = require('./')
const { encode } = require('./encodePgn')

const getPgnInfo = createGetInfo(pgns)

/* globals describe test expect */

describe('encode', () => {
  test('test most basic ISO Request encode', () => {
    const packet = {
      pgn: 59904,
      prio: 6,
      dst: 255,
      field: {
        pgn: 60928,
      },
    }
    const res = encode(getPgnInfo, packet)
    expect(res.info.name).toBe('ISO Request')
    expect(byteString(res.data)).toBe('00,EE,00')
    const msgs = encodeYDRAW(res)
    expect(msgs[0]).toBe('18eaff00 00 EE 00\r\n')
  })
  test('test fluid level encode', () => {
    const packet = {
      pgn: 127505,
      prio: 6,
      dst: 255,
      field: {
        instance: 3,
        type: 1,
        level: 96.3095179092194,
        capacity: 0.23000000417232513,
      },
    }
    const res = encode(getPgnInfo, packet)
    expect(res.info.name).toBe('Fluid Level')
    // console.log(res)
    expect(byteString(res.data)).toBe('13,0D,5E,FC,08,00,00,FF')
    // const msgs = encodeYDRAW(res)
    // expect(msgs[0]).toBe('18eaff00 00 EE 00\r\n')
  })
})
