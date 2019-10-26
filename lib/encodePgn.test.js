const pgns = require('nori-pgns')
const { buffHexStr, createGetInfo } = require('./')
const { encode } = require('./encodePgn')

const getPgnInfo = createGetInfo(pgns)

/* globals describe test expect */

describe('encode', () => {
  test('test most basic encode', () => {
    const packet = {
      pgn: 59904,
      dst: 255,
      field: {
        pgn: 60928,
      },
    }
    const res = encode(getPgnInfo, packet)
    expect(res.info.name).toBe('ISO Request')
    expect(buffHexStr(res.fieldData[0])).toBe('00,EE,00')
    expect(buffHexStr(res.data)).toBe('00,EE,00')
  })
})
