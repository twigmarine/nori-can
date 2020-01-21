const pgns = require('nori-pgns')
const { hexSpStrBuff } = require('./utilities')
const { addFields } = require('./addFields')
const { createGetInfo } = require('./pgns')
const { parse } = require('./parsePgn')

/* globals describe test expect */

const getPgnInfo = createGetInfo(pgns)

describe('addFields', () => {
  test('Parse ASCII fields 1', () => {
    const info = {
      data: hexSpStrBuff('15,05,8A,19,59,44,57,47,2D,30,32,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,31,2E,33,32,20,30,33,2F,30,38,2F,32,30,31,39,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,4E,4D,45,41,20,32,30,30,30,20,57,69,2D,46,69,20,47,61,74,65,77,61,79,20,20,20,20,20,20,20,20,20,30,30,36,30,31,31,36,36,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,01,01', ','),
      pgn: 126996,
      dataReady: true,
    }
    const result = addFields(parse(getPgnInfo, null, info))
    // console.log(result.field)
    expect(result.field.productCode.value).toBe(6538)
    expect(result.field.modelId.value).toBe('YDWG-02')
    expect(result.field.firmware.value).toBe('1.32 03/08/2019')
    expect(result.field.modelVersion.value).toBe('NMEA 2000 Wi-Fi Gateway')
    expect(result.field.serial.value).toBe('00601166')
    expect(result.field.certificationLevel.value).toBe(1)
    expect(result.field.len.value).toBe(1)
  })
  test('Parse ASCII fields 2', () => {
    const info = {
      data: hexSpStrBuff('B0,04,B1,33,50,72,65,63,69,73,69,6F,6E,2D,39,20,43,6F,6D,70,61,73,73,20,20,20,20,20,20,20,20,20,20,20,20,20,32,2E,30,2E,30,2D,30,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,31,2E,30,2E,30,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,31,30,38,30,38,35,31,37,39,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,01,01', ','),
      pgn: 126996,
      dataReady: true,
    }
    const result = addFields(parse(getPgnInfo, null, info))
    // console.log(result.field)
    expect(result.field).toMatchObject({
      nmea2000Version: { value: 1.2 },
      productCode: { value: 13233 },
      modelId: { value: 'Precision-9 Compass' },
    })
  })
  test('Parse ASCII fields 3', () => {
    const info = {
      data: hexSpStrBuff('D0,07,5D,16,45,33,32,31,35,38,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,30,34,30,32,30,30,2E,30,31,2E,31,35,2E,30,31,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,52,61,79,6D,61,72,69,6E,65,20,41,49,53,36,35,30,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,30,35,32,30,31,32,37,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,01,01', ','),
      pgn: 126996,
      dataReady: true,
    }
    const result = addFields(parse(getPgnInfo, null, info))
    // console.log(result.field)
    expect(result.field).toMatchObject({
      nmea2000Version: { value: 2 },
      productCode: { value: 5725 },
      modelId: { value: 'E32158' },
      modelVersion: { value: 'Raymarine AIS650' },
    })
  })
  test('Parse ASCII fields 4', () => {
    const info = {
      data: hexSpStrBuff('34,08,0B,18,44,53,4D,34,31,30,00,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,31,2E,38,2E,31,2E,32,00,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,31,2E,30,00,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,31,38,38,30,35,35,38,00,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,FF,02,05', ','),
      pgn: 126996,
      dataReady: true,
    }
    const result = addFields(parse(getPgnInfo, null, info))
    // console.log(result.field)
    expect(result.field).toMatchObject({
      nmea2000Version: { value: 2.1 },
      productCode: { value: 6155 },
      modelId: { value: 'DSM410' },
      modelVersion: { value: '1.0' },
    })
  })
  test('get Config', () => {
    const info = {
      data: hexSpStrBuff('13,01,55,6E,64,65,72,20,43,68,61,72,74,20,54,61,62,6C,65,02,01,24,01,59,61,63,68,74,20,44,65,76,69,63,65,73,20,4C,74,64,2E,2C,20,77,77,77,2E,79,61,63,68,74,64,2E,63,6F,6D', ','),
      pgn: 126998,
      dataReady: true,
    }
    const result = addFields(parse(getPgnInfo, null, info))
    // console.log(result.field)
    expect(result.field).toEqual({
      installationDescription1: {
        bitLength: 136,
        type: 'ASCII or UNICODE string starting with length and control byte',
        name: 'Installation Description #1',
        value: 'Under Chart Table',
        byteLength: 17,
        encoding: 1,
        encodingLabel: 'ASCII',
        stringData: undefined,
      },
      installationDescription2: {
        bitLength: 0,
        type: 'ASCII or UNICODE string starting with length and control byte',
        name: 'Installation Description #2',
        value: null,
        byteLength: 0,
        encoding: 1,
        encodingLabel: 'ASCII',
        stringData: undefined,
      },
      manufacturerInformation: {
        bitLength: 272,
        type: 'ASCII or UNICODE string starting with length and control byte',
        name: 'Manufacturer Information',
        value: 'Yacht Devices Ltd., www.yachtd.com',
        byteLength: 34,
        encoding: 1,
        encodingLabel: 'ASCII',
        stringData: undefined,
      },
    })
  })
})
