const pgns = require('nori-pgns')
const { byteString, createGetInfo, encodeYDRAW } = require('./')
const { encode } = require('./encodePgn')

const getPgnInfo = createGetInfo(pgns)

/* globals describe test expect */

describe('encode', () => {
  test('test most basic encode', () => {
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
    expect(byteString(res.fieldData[0])).toBe('00,EE,00')
    expect(byteString(res.data)).toBe('00,EE,00')
    const msgs = encodeYDRAW(res)
    expect(msgs[0]).toBe('18eaff00 00 EE 00\r\n')
  })
})
