const {
  at, cond, curry, flow, isEmpty, isMap, isString, join, map, values,
} = require('lodash/fp')
const { processStringInput } = require('./stringMsg')
const { parse } = require('./parsePgn')
const { addFields } = require('./addFields')

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

const basicParse = cond([
  [isString, processStringInput],
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

module.exports = {
  dataParser,
  parser,
  processStringInput,
  processPackets,
}
