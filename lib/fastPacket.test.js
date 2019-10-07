const { parseFastPacket, restoreFastPacket } = require('./fastPacket')
const { hexStrBuff } = require('./utilities')

/* globals describe test expect */

const d1 = hexStrBuff('c013b8caef00b8ca')
const d2 = hexStrBuff('c1ef003930303032')
const d3 = hexStrBuff('c233ffff00ffffff')

describe('parseFastPacket', () => {
  test('1st frame', () => {
    expect(parseFastPacket(d1)).toEqual({
      sequenceId: 6,
      frameIndex: 0,
      totalBytes: 0x13,
      totalFrames: 3,
      frameData: hexStrBuff('b8caef00b8ca'),
    })
    expect(parseFastPacket(hexStrBuff('002ffffc46103773'))).toEqual({
      sequenceId: 0,
      frameIndex: 0,
      totalBytes: 47,
      totalFrames: 7,
      frameData: hexStrBuff('fffc46103773'),
    })
  })
  test('2nd frame', () => {
    expect(parseFastPacket(d2)).toEqual({
      sequenceId: 6,
      frameIndex: 0x1,
      frameData: hexStrBuff('ef003930303032'),
    })
  })
  test('3rd frame', () => {
    expect(parseFastPacket(d3)).toEqual({
      sequenceId: 6,
      frameIndex: 0x2,
      frameData: hexStrBuff('33ffff00ffffff'),
    })
  })
})
function expectedState(canId) {
  return (seq) => new Map([
    ['bar', 'baz'],
    [canId, new Map([[6, seq]])],
  ])
}

describe('restoreFastPacket', () => {
  test('take frame in backward order', () => {
    const state = new Map([['bar', 'baz']])
    const expectedState1 = expectedState(0x18EEFF00)
    restoreFastPacket({ canId: 0x18EEFF00, data: d3 }, state)
    const f1 = [undefined, undefined, hexStrBuff('33ffff00ffffff')]
    expect(state).toEqual(expectedState1({
      frames: f1,
      frameCount: 1,
      sequenceId: 6,
    }))

    restoreFastPacket({ canId: 0x18EEFF00, data: d2 }, state)
    const f2 = [
      undefined,
      hexStrBuff('ef003930303032'),
      hexStrBuff('33ffff00ffffff'),
    ]
    expect(state).toEqual(expectedState1({
      frames: f2,
      frameCount: 2,
      sequenceId: 6,
    }))

    const state3 = restoreFastPacket({ canId: 0x18EEFF00, data: d1 }, state)
    const f3 = [
      hexStrBuff('b8caef00b8ca'),
      hexStrBuff('ef003930303032'),
      hexStrBuff('33ffff00ffffff'),
    ]
    expect(state).toEqual(new Map([['bar', 'baz'], [0x18EEFF00, new Map()]]))
    expect(state3).toEqual({
      data: hexStrBuff('b8caef00b8caef00393030303233ffff00ffff'),
      frames: f3,
      sequenceId: 6,
      frameCount: 3,
      totalBytes: 19,
      totalFrames: 3,
    })
  })

  test('take frame in 1,3,2 order', () => {
    const state = new Map([['bar', 'baz']])
    const expectedState2 = expectedState('foo')
    restoreFastPacket({ canId: 'foo', data: d1 }, state)
    expect(state).toEqual(expectedState2({
      frames: [hexStrBuff('b8caef00b8ca')],
      totalBytes: 19,
      totalFrames: 3,
      frameCount: 1,
      sequenceId: 6,
    }))

    restoreFastPacket({ canId: 'foo', data: d3 }, state)
    const f2 = [
      hexStrBuff('b8caef00b8ca'),
      undefined,
      hexStrBuff('33ffff00ffffff'),
    ]
    expect(state).toEqual(expectedState2({
      frames: f2,
      frameCount: 2,
      totalBytes: 19,
      totalFrames: 3,
      sequenceId: 6,
    }))

    const state3 = restoreFastPacket({ canId: 'foo', data: d2 }, state)
    const f3 = [
      hexStrBuff('b8caef00b8ca'),
      hexStrBuff('ef003930303032'),
      hexStrBuff('33ffff00ffffff'),
    ]
    expect(state).toEqual(new Map([['bar', 'baz'], ['foo', new Map()]]))
    expect(state3).toEqual({
      data: hexStrBuff('b8caef00b8caef00393030303233ffff00ffff'),
      frames: f3,
      frameCount: 3,
      totalBytes: 19,
      totalFrames: 3,
      sequenceId: 6,
    })
  })
})
