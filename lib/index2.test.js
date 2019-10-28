const _ = require('lodash/fp')
const { onTrue } = require('understory')
const pgns = require('nori-pgns')
const pgnSamples = require('nori-pgns/samples')
const { encodeCanId, getParser, hexToBuff } = require('./')

/* globals describe test expect */

const parse = getParser(pgns)

const getVals = ({
  timestamp, prio, src, dst, pgn, field,
}) => ({
  timestamp,
  prio,
  src,
  dst,
  pgn,
  field: _.mapValues('value', field),
})
const getInput = onTrue(_.isObject, ({ data, pgn }) => ({
  canId: encodeCanId({ pgn }),
  data: hexToBuff(data),
  dataReady: true,
  pgn,
}))
describe('Testing samples', () => {
  function runSampleTest({ expected, input, run }) {
    if (!run) return
    const expectedRes = expected
    delete expectedRes.description
    expect(getVals(parse(getInput(input))[0])).toEqual(expectedRes)
  }
  function runSampleTests({ pgn, samples }) {
    if (!_.some({ run: true }, samples)) return
    test(`Test Sample for PGN ${pgn}`, () => {
      _.forEach(runSampleTest, samples)
    })
  }
  _.forEach(runSampleTests, pgnSamples)
})
