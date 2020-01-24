const {
  at, cond, curry, flow, get, isEmpty, isMap, isString,
  join, map, overEvery, values,
} = require('lodash/fp')
const { setField } = require('prairie')
const { processStringInput } = require('./stringMsg')
const { getFieldsData, parse } = require('./parsePgn')
const { addFields } = require('./addFields')
const { createGetInfo } = require('./pgns')

// fast packet index key
const fpk = flow(at(['canId', 'seqState.sequenceId']), join('-'))

// Process an array of messages/frames.
// packet.info.singleFrame - packet.data
// canId, sequenceId -
const processPackets = curry((getPgnInfo, state, packets) => {
  if (isEmpty(packets)) return undefined
  if (packets.length === 1) return [parse(getPgnInfo, state, packets[0])]
  const fastPacketIndex = {}
  const results = []
  packets.forEach((packet) => {
    // console.log(i, input)
    const message = parse(getPgnInfo, state, packet)
    // console.log(packet)
    if (message.info.singleFrame) results.push(message)
    fastPacketIndex[fpk(message)] = message // overwrite previous of same.
  })
  return results.concat(values(fastPacketIndex))
})

function dataParser(getPgnInfo, initStateMap) {
  const state = isMap(initStateMap) ? initStateMap : new Map()
  return flow(
    processPackets(getPgnInfo, state), // Split data into a field array.
    map(addFields), // Add field info details.
  )
}

const hasData = overEvery([get('pgn'), get('data')])
const basicParse = cond([
  [isString, processStringInput],
  [hasData, Array],
])

/*
 * Init state storage and pass along to parse function.
 * @param  {function} [getPgnInfo] Takes all parsed pgn info and returns fields rules.
 * @return {Array} [description]
 */
function parser(getPgnInfo, initStateMap) {
  return flow(
    basicParse,
    dataParser(getPgnInfo, initStateMap),
  )
}

/**
 * Use this with pgn array that has fixes applied to it already.
 * @param  {array} pgns require('nori-pgns')
 * @return {function}      [description]
 */
const getParser = (pgns) => parser(createGetInfo(pgns))
const processData = curry((getPgnInfo, info) => addFields(parse(getPgnInfo, null, info)))

// Must have { data, info } set already. One full frame.
const processBinary = flow(
  setField('fieldData', getFieldsData),
  addFields,
)

module.exports = {
  dataParser,
  parser,
  getParser,
  processBinary,
  processData,
  processStringInput,
  processPackets,
}
