const {
  at, cond, curry, flow, isEmpty, isString, join, map, values,
} = require('lodash/fp')
const splitLines = require('split-lines')
const { basicGetPgnInfo } = require('./pgns')
const { parseString } = require('./stringMsg')
const { parse } = require('./parsePgn')
const { addFields } = require('./addFields')

// fast packet index key
const fpk = flow(at(['canId', 'seqState.sequenceId']), join('-'))
// Process an array of messages/frames.
// packet.info.singleFrame - packet.data
// canId, sequenceId -
const processPackets = curry((getPgnInfo, state, packets) => {
  if (isEmpty(packets)) return undefined
  if (packets.length === 1) return [parse(getPgnInfo, state, messages[0])]
  const fastPacketIndex = {}
  const results = []
  packets.forEach((packet, i) => {
    // console.log(i, input)
    const message = parse(getPgnInfo, state, packet)
    // console.log(packet)
    if (message.info.singleFrame) results.push(message)
    fastPacketIndex[fpk(message)] = message // overwrite previous of same.
  })
  return results.concat(values(fastPacketIndex))
})

// Process a string that may have many messages/frames.
function processStringInput(input) {
  const messages = splitLines(input) // _.compact()
  if (!messages.length) return undefined
  return messages.map(parseString)
}
const basicParse = cond([
  [isString, processStringInput]
])

// Init state and pass along to parse function.
function parser(getPgnInfo = basicGetPgnInfo) {
  const state = new Map()
  return flow(
    basicParse, // parse canId info.
    processPackets(getPgnInfo, state), // add field info details. Split data into a field array.
    map(addFields) // make field info more friendly
  )
}

module.exports = {
  parser,
  processStringInput,
  processPackets,
}
