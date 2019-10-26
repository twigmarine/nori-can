const {
  compact, cond, curry, flow, isEmpty,
  isString, negate, overSome, startsWith, stubTrue, trim, toNumber, zipObject,
} = require('lodash/fp')
const { decode } = require('base64-arraybuffer')
const splitLines = require('split-lines')
const {
  arrBuff, byteString, hexArrBuff, hexStrBuff, rmChecksum,
  trimWrap, compute0183Checksum, hexByte,
} = require('./utilities')
const {
  buildCanId, encodeCanIdString, parseCanIdStr,
} = require('./canId')
const { createFastPackets } = require('./fastPacket')
// const { parse: parseDate } = require('date-fns')

/**
 * Helper function that helps merge canId fields with format, data, and others.
 * The idea here is to reflect what was in the source and not remove or add.
 * If the source has a len or timestamp attribute it should be added but not created.
 * @param  {Object} canIdInfo The result of parseCanId, parseCanIdStr, or buildCanId.
 * @param  {string} format    String that defines the source format.
 * @param  {Buffer} data      Buffer array that contains the fields data.
 * @param  {Object} [rest={}] Anything else to be added like len, timestamp, direction.
 * @return {Object}           All canId fields with format and data props added.
 */
function buildMsg(canIdInfo, format, data, rest = {}) {
  return {
    ...canIdInfo,
    format,
    data,
    ...rest,
  }
}
function buildErrMsg(msg, input) {
  if (input && isString(input)) return `${msg} - ${input}`
  return msg
}
const buildErr = curry((format, msg, input) => ({
  error: new Error(buildErrMsg(msg, input)), format, input,
}))

// 2016-02-28T19:57:02.364Z,2,127250,7,255,8,ff,10,3b,ff,7f,ce,f5,fc
exports.isActisense = (input) => input.charAt(10) === 'T' && input.charAt(23) === 'Z'
exports.parseActisense = (input) => {
  const [timestamp, prio, pgn, src, dst, len, ...data] = input.split(',')
  return buildMsg(
    buildCanId(prio, pgn, dst, src),
    'Actisense',
    hexArrBuff(data),
    { len: Number(len), timestamp },
  )
}
exports.encodeActisense = ({
  pgn, data, timestamp, prio = 2, dst = 255, src = 0,
}) => ([
  timestamp || new Date().toISOString(),
  prio, pgn, src, dst, data.byteLength,
  byteString(data),
].join(','))

exports.toActisenseSerialFormat = (pgn, data, dst = 255, src = 0) => exports.encodeActisense({
  pgn, data, dst, src,
})

// 16:29:27.082 R 09F8017F 50 C3 B8 13 47 D8 2B C6
exports.isYDRAW = (input) => {
  if (input.charAt(2) !== ':') return false
  const direction = input.substr(12, 3)
  return direction === ' R ' || direction === ' T '
}
exports.parseYDRAW = (input) => {
  const parts = input.split(' ')
  if (parts.length < 4) return buildErr('YDRAW', 'Invalid parts.', input)
  const [time, direction, canId, ...data] = parts // time format HH:mm:ss.SSS
  return buildMsg(
    parseCanIdStr(canId), 'YDRAW', hexArrBuff(data),
    { direction, time, input },
  )
}
// 19F51323 01 02<CR><LF>
exports.encodeYDRAW = ({ data, ...canIdInfo }, seqId) => {
  const canId = encodeCanIdString(canIdInfo)
  const pgns = data.byteLength > 8 ? createFastPackets(data, seqId) : [data]
  return pgns.map((buffer) => `${canId} ${byteString(buffer, ' ')}\r\n`)
}

// $PCDIN,01F119,00000000,0F,2AAF00D1067414FF*59
exports.isPCDIN = startsWith('$PCDIN,')
exports.isN2KOver0183 = exports.isPCDIN
exports.parsePCDIN = (input) => {
  const [prefix, pgn, timeHex, src, data] = input.split(',')
  let timer = parseInt(timeHex, 32)

  timer /= 1024
  timer += 1262304000 // starts epoch time from 1/1/2010
  timer *= 1000

  return buildMsg(
    buildCanId(0, parseInt(pgn, 16), 255, parseInt(src, 16)),
    'PCDIN',
    hexStrBuff(rmChecksum(data)),
    { prefix, timer, timestamp: new Date(timer) },
  )
}
exports.parseN2KOver0183 = exports.parsePCDIN

function toPaddedHexString(num, len) {
  const str = num.toString(16).toUpperCase()
  return '0'.repeat(len - str.length) + str
}

exports.encodePCDIN = ({
  prefix = '$PCDIN', pgn, data, dst = 255,
}) => {
  const sentence = [prefix, toPaddedHexString(pgn, 6), '0000180C', hexByte(dst).toUpperCase(), byteString(data, '').toUpperCase()].join(',')
  return sentence + compute0183Checksum(sentence)
}

// iKonvert
// !PDGY,126992,3,2,255,0.563,d2009e45b3b8821d
exports.isPDGY = startsWith('!PDGY,')
exports.parsePDGY = (input) => {
  const parts = input.split(',')
  if (parts.length !== 7) return buildErr('iKonvert', 'Invalid parts.', input)
  const [prefix, pgn, prio, src, dst, timer, data] = parts
  return buildMsg(
    buildCanId(prio, pgn, dst, src), 'PDGY', decode(data),
    { timer: Number(timer), prefix },
  )
}
exports.encodePDGY = ({
  prefix = '!PDGY', pgn, data, dst = 255,
}) => (
  [prefix, pgn, dst, data.toString('base64')].join(',')
)

exports.isPDGYdebug = startsWith('$PDGY,')
exports.parsePDGYdebug = (input) => {
  const [prefix, pgn, ...fieldParts] = input.split(',')
  const fieldVals = fieldParts.map(toNumber)
  const fields = zipObject([
    'busLoad', 'errors', 'deviceCount', 'timer', 'gatewaySrc', 'rejectedTX',
  ], fieldVals)
  const src = fields.gatewaySrc
  return buildMsg(
    buildCanId(3, pgn, src, src), 'PDGYdebug', arrBuff(fieldVals),
    { fields, prefix },
  )
}

// candump1 Angstrom
// <0x18eeff01> [8] 05 a0 be 1c 00 a0 a0 c0
exports.isCandump1 = startsWith('<0x')
exports.parseCandump1 = (input) => {
  const [canId, len, ...data] = input.split(' ')
  return buildMsg(
    parseCanIdStr(trimWrap(canId)), 'candump1', hexArrBuff(data),
    { len: Number(trimWrap(len)) },
  )
}

// candump2 Debian
// can0  09F8027F   [8]  00 FC FF FF 00 00 FF FF
exports.isCandump2 = startsWith('can')
exports.parseCandump2 = (input) => {
  const [bus, canId, len, ...data] = compact(input.split(' '))
  return buildMsg(
    parseCanIdStr(canId), 'candump2', hexArrBuff(data),
    { bus, len: Number(trimWrap(len)) },
  )
}

// candump3 log
// (1502979132.106111) slcan0 09F50374#000A00FFFF00FFFF
exports.isCandump3 = startsWith('(')
exports.parseCandump3 = (input) => {
  const [timestamp, bus, canFrame] = input.split(' ')
  const [canId, data] = canFrame.split('#')
  return buildMsg(
    parseCanIdStr(canId), 'candump3', hexArrBuff(data), { timestamp, bus },
  )
}

const hasErr = overSome([negate(isString), isEmpty])
exports.parseN2kString = cond([
  [hasErr, buildErr('INVALID', 'Input not string or empty.')],
  [exports.isActisense, exports.parseActisense],
  [exports.isYDRAW, exports.parseYDRAW],
  [exports.isPCDIN, exports.parsePCDIN],
  [exports.isPDGY, exports.parsePDGY],
  [exports.isCandump1, exports.parseCandump1],
  [exports.isCandump2, exports.parseCandump2],
  [exports.isCandump3, exports.parseCandump3],
  [exports.isPDGYdebug, exports.parsePDGYdebug],
  [stubTrue, buildErr('MISSING_PARSER', 'Parser not found for input.')],
])

// Process a single line.
exports.parseString = flow(
  trim,
  exports.parseN2kString,
)
// Process a string that may have many lines/messages/frames.
function processStringInput(input) {
  // Is running compact() here too computationally expensive?
  const messages = compact(splitLines(input))
  if (!messages.length) return undefined
  return messages.map(exports.parseString)
}
exports.processStringInput = processStringInput
