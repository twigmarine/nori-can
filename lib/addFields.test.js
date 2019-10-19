const pgns = require('@canboat/pgns')
const { hexSpStrBuff } = require('./utilities')
const { addFields } = require('./addFields')
const { createGetInfo } = require('./pgns')
const { parse } = require('./parsePgn')

/* globals describe test expect */

const getPgnInfo = createGetInfo(pgns)

describe('addFields', () => {
  const info = {
    data: hexSpStrBuff('15,05,8A,19,59,44,57,47,2D,30,32,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,31,2E,33,32,20,30,33,2F,30,38,2F,32,30,31,39,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,4E,4D,45,41,20,32,30,30,30,20,57,69,2D,46,69,20,47,61,74,65,77,61,79,20,20,20,20,20,20,20,20,20,30,30,36,30,31,31,36,36,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,01,01', ','),
    pgn: 126996,
    dataReady: true,
  }
  const result = addFields(parse(getPgnInfo, null, info))
  // console.log(result)
  test('Parse ASCII fields', () => {
    expect(result.field.modelId.value).toBe('YDWG-02')
    expect(result.field.softwareVersionCode.value).toBe('1.32 03/08/2019')
    expect(result.field.modelVersion.value).toBe('NMEA 2000 Wi-Fi Gateway')
    expect(result.field.modelSerialCode.value).toBe('00601166')
  })
})
