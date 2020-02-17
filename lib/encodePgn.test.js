const pgns = require('nori-pgns')
const {
  byteString, createGetInfo, encodeYDRAW, processData,
} = require('./')
const { encode } = require('./encodePgn')

const getPgnInfo = createGetInfo(pgns)
const decode = processData(getPgnInfo)

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
      field: {
        instance: 3,
        type: 1,
        level: 96.3095179092194,
        capacity: 0.2300000041723251,
      },
    }
    const res = encode(getPgnInfo, packet)
    expect(res.info.name).toBe('Fluid Level')
    // console.log(res)
    expect(byteString(res.data)).toBe('13,0D,5E,FC,08,00,00,FF')
    const packet2 = decode({
      data: res.data,
      // dataReady: true, // not needed because single frame.
      pgn: 127505,
    })
    // const msgs = encodeYDRAW(res)
    expect(packet2.field.instance.value).toBe(packet.field.instance)
    expect(packet2.field.type.value).toBe(packet.field.type)
    expect(packet2.field.level.value).toBe(96.308)
    expect(packet2.field.capacity.value).toBe(0.23)
    // CONFIRM SAME AS BEFORE
    const res2 = encode(getPgnInfo, { pgn: 127505, field: packet2.field })
    expect(res2.info.id).toBe('fluidLevel')
    expect(byteString(res2.data)).toBe('13,0D,5E,FC,08,00,00,FF')
  })
  test('test temperature', () => {
    const packet = {
      pgn: 130316,
      prio: 6,
      dst: 255,
      field: {
        sid: 255,
        instance: 0,
        source: 8,
        actual: 21 + 274.15,
        set: null,
      },
    }
    const res = encode(getPgnInfo, packet)
    expect(res.info.name).toBe('Temperature Extended Range')
    expect(byteString(res.data)).toBe('FF,00,08,EE,80,04,FF,FF')
    const { field } = decode({ data: res.data, pgn: 130316 })
    expect(field.source.label).toBe('Heating System')
    expect(field.actual.value).toBe(21 + 274.15)
    expect(field.set.value).toBe(null)
    // const msgs = encodeYDRAW(res)
    // expect(msgs[0]).toBe('18eaff00 00 EE 00\r\n')
  })
})
