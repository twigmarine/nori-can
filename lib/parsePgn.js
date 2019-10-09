const { curry, isNumber, map } = require('lodash/fp')
const { setField } = require('prairie')
const { getDataView, subByteLE } = require('get-bits')
const { Int64LE, Uint64LE } = require('int64-buffer')
const Big = require('big.js')
const { dataViewEqual, hexStrBuff } = require('./utilities')
const { restoreFastPacket } = require('./fastPacket')

function buildReadNumber(nullValue, readMethod) {
  return (view) => {
    const value = view[readMethod](0, true)
    return value === nullValue ? null : value
  }
}
const toInt8 = buildReadNumber(0x7f, 'getInt8')
const toUint8 = buildReadNumber(0xff, 'getUint8')
const toInt16 = buildReadNumber(0x7fff, 'getInt16')
const toUint16 = buildReadNumber(0xffff, 'getUint16')
const maxInt32 = 0x7fffffff
const toInt32 = buildReadNumber(maxInt32, 'getInt32')
const maxUint32 = 0xffffffff
const toUint32 = buildReadNumber(maxUint32, 'getUint32')
// 48 bit number can use native Number.

// Will 64-bit number fit into native Number without loss.
// @TODO - Find a better way.
// Sometimes devices pad with 0x00 bytes because number is less precise?
const can64fit = (num, big) => num.toString(16) === big.toString(16)

const maxInt64 = new DataView(hexStrBuff('ffffffffffffff7f').buffer)
// getBigInt64() not yet available in Safari and iOS.
function toInt64(view) {
  if (dataViewEqual(view, maxInt64)) return null
  // So far Int64LE only used for its toNumber method.
  const value = new Int64LE(view.buffer)
  const num = value.toNumber()
  return can64fit(num, value) ? num : value
}
const maxUint64 = new Uint64LE(0xffffffff, 0xffffffff)
// const toUint64 = buildReadNumber(0xffffffffffffffff, 'getBigInt64')
function toUint64(view) {
  const value = new Uint64LE(view.buffer)
  return value === maxUint64 ? null : value
}

// data must be a DataView.
function toNumber(view, signed) {
  switch (view.byteLength) {
    case 0:
      return 0
    case 1: // 8-bit
      return signed ? toInt8(view) : toUint8(view)
    case 2: // 16-bit
      return signed ? toInt16(view) : toUint16(view)
    case 4: // 32-bit
      return signed ? toInt32(view) : toUint32(view)
    case 8: // 64-bit
      return signed ? toInt64(view) : toUint64(view)
      // return JSBI.BigInt(signed ? toInt64(view) : toUint64(view))
    default:
      return view
  }
}
function toPrecise(view, signed, resolution) {
  // 1e-16 === Math.pow(10, -16) max 15 decimal places
  const num = toNumber(view, signed)
  if (resolution) {
    if (resolution === 1) return num
    // Using Big because of javascript decimal errors. 15300000 * 1e-6 !== 15.3
    // Maybe there is a way to figure out if its use is required?
    if (isNumber(num)) return parseFloat(new Big(num).times(resolution))
  }
  return num
}

// data should be a Uint8Array
const fieldData = curry((data, field) => {
  // Byte boundary just do a split.
  if (field.byteEnd) {
    // if (field.bytes === 1) return data[field.byteStart]
    return toPrecise(
      new DataView(data.slice(field.byteStart, field.byteEnd).buffer),
      field.signed,
      field.resolution,
    )
  }
  // Under 8 bits and within a byte boundary.
  if (field.withinByte) {
    return subByteLE(data[field.byteStart], field.bitStart, field.bitLength)
  }
  // Larger sizes will require a Buffer/DataView.
  return toPrecise(
    getDataView(data, field.bitOffset, field.bitLength),
    field.signed,
    field.resolution,
  )
})

function splitPgn(input) {
  // input.data should be an Uint8Array
  const fields = map(fieldData(input.data), input.info.fields)
  // Figure out how many sets of repeating fields. Repeat field definitions.
  return fields
  // return set('fields', fields, input)
}

function parse(getPgnInfo, state, input) {
  // add info property with result of getPgnInfo(input)
  const packet = setField('info', getPgnInfo, input)
  // console.log(packet)
  // Process single frame packets.
  if (packet.info.singleFrame) {
    packet.fieldData = splitPgn(packet)
    // packet.seqState = {}
  } else {
    packet.seqState = restoreFastPacket(packet, state)
    if (packet.seqState.data) {
      packet.data = packet.seqState.data
      delete packet.seqState.data
      delete packet.seqState.frames
      packet.fieldData = splitPgn(packet)
    }
  }
  return packet
}

// Init state and pass along to parse function.
function parser(getPgnInfo) {
  const state = new Map()
  return (input) => parse(getPgnInfo, state, input)
}

module.exports = {
  splitPgn,
  parse,
  parser,
  toNumber,
}
