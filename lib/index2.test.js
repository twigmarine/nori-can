const _ = require('lodash/fp')
const { onTrue } = require('understory')
const pgns = require('nori-pgns')
const pgnSamples = require('nori-pgns/samples')
const {
  encodeCanId, arrBuff, getParser, hexToBuff,
} = require('./')

/* globals describe test expect */

const parse = getParser(pgns)

const getVals = ({
  timestamp, prio, src, dst, pgn, field, msgId,
}) => ({
  msgId,
  timestamp,
  prio,
  src,
  dst,
  pgn,
  field: _.mapValues('value', field),
})
const getInput = onTrue(_.isObject, ({ data, pgn }) => ({
  canId: encodeCanId({ pgn }),
  data: _.isArray(data) ? arrBuff(data) : hexToBuff(data),
  dataReady: true,
  pgn,
}))

const getRes = _.flow(getInput, parse, _.first, getVals)

describe('Testing samples', () => {
  function runSampleTest({ expected, input, run }) {
    if (!run) return
    const expectedRes = expected
    delete expectedRes.description
    const res = getRes(input)
    if (_.isEmpty(expectedRes)) console.log(res)
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
