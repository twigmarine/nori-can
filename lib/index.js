// Make a pull request if you want something here.
// You can always require('canboat-core/lib/file.js') if you need something in a file.
const { addFields } = require('./addFields')
const {
  dataParser, getParser, parser, processBinary, processData, processPackets,
} = require('./core')
const {
  addCanId, canIdString, encodeCanId, parseCanId, parseCanIdStr,
} = require('./canId')
const {
  encodeActisense, encodePCDIN, encodePDGY, encodeYDRAW, encodePgn,
  parseString, processStringInput,
} = require('./stringMsg')
const {
  createFastPackets, parseFastPacket, restoreFastPacket,
} = require('./fastPacket')
const {
  buildEncode, createData, createPgnStrings, encode,
} = require('./encodePgn')
const { getFieldData, getFieldsData, parse } = require('./parsePgn')
const {
  canboatGetInfo, canboatPgnMap, createGetInfo, createPgnMap,
  fixFields, fixPgn, pgnInfoById, prepField, prepFields, prepInfo, prepPgn,
} = require('./pgns')
const cleanup = require('./cleanup')
const {
  arrBuff, buffHexArr, byteString, hexByte, hexSpStrBuff, hexToBuff, hexToView, u8Concat,
} = require('./utilities')
const {
  fromNumber, numMap, toNumber, toPrecise,
} = require('./numbers')

module.exports = {
  addCanId,
  addFields,
  arrBuff,
  buffHexArr,
  buildEncode,
  byteString,
  canboatGetInfo,
  canboatPgnMap,
  canIdString,
  cleanup,
  createData,
  createFastPackets,
  createGetInfo,
  createPgnMap,
  createPgnStrings,
  dataParser,
  encode,
  encodeActisense,
  encodeCanId,
  encodePCDIN,
  encodePDGY,
  encodeYDRAW,
  encodePgn,
  fixFields,
  fixPgn,
  fromNumber,
  getFieldData,
  getFieldsData,
  getParser,
  hexByte,
  hexSpStrBuff,
  hexToBuff,
  hexToView,
  numMap,
  parse,
  parser,
  parseCanId,
  parseCanIdStr,
  parseFastPacket,
  parseString,
  pgnInfoById,
  prepField,
  prepFields,
  prepInfo,
  prepPgn,
  processBinary,
  processData,
  processPackets,
  processStringInput,
  restoreFastPacket,
  toNumber,
  toPrecise,
  u8Concat,
}
