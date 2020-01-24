const _ = require('lodash/fp')
const { onTrue } = require('understory')
const pgns = require('nori-pgns') // private repo
const pgnSamples = require('nori-pgns/samples')
const {
  byteString, encodeCanId, arrBuff, getParser, hexToBuff, pgnInfoById, processBinary,
} = require('./')

/* globals describe test expect */
const pgnIndex = pgnInfoById(pgns)
const parse = getParser(pgns)

const getVals = (input) => ({
  ..._.pick(['dst', 'msgId', 'prio', 'pgn', 'src', 'timestamp'], input),
  id: input.info.id,
  data: byteString(input.data),
  field: _.mapValues('value', input.field),
})
const getInput = onTrue(_.isObject, ({ data, pgn }) => ({
  canId: encodeCanId({ pgn }),
  data: _.isArray(data) ? arrBuff(data) : hexToBuff(data),
  dataReady: true,
  pgn,
}))

const getRes = _.flow(getInput, parse, _.first, getVals)

describe('Testing samples', () => {
  function runSampleTest({
    debug, expected, input, run,
  }) {
    if (!run) return
    const expectedRes = expected || {}
    delete expectedRes.description
    const res = getRes(input)
    if (debug || _.size(expectedRes) < 2) {
      console.log(res)
    }
    expect(res).toMatchObject(expectedRes)
  }
  function runSampleTests({ pgn, samples }) {
    if (!_.some({ run: true }, samples)) return
    test(`Test Sample for PGN ${pgn}`, () => {
      _.forEach(runSampleTest, samples)
    })
  }
  _.forEach(runSampleTests, pgnSamples)
})

describe('known pgn binary data. processBinary()', () => {
  const input = {
    data: hexToBuff('01,b6,05,ff,7f,ff,ff,00'),
    info: pgnIndex.batteryStatus,
  }
  test('adds fieldData and field fields to input', () => {
    const result = processBinary(input)
    expect(result.fieldData[0]).toBe(1)
    expect(result.field.voltage.value).toBe(14.62)
  })
})
