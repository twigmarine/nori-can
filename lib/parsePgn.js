const {
  curry, isNumber, map,
} = require('lodash/fp')
// const { setField } = require('prairie')
const { getDataView, subByteLE } = require('get-bits')
const { BitView } = require('bit-buffer')
const { Int64LE, Uint64LE } = require('int64-buffer')
const Big = require('big.js')
const { dataViewEqual, hexStrBuff } = require('./utilities')
const { restoreFastPacket } = require('./fastPacket')
const { dataPosition, startLengthByte } = require('./pgns')

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
function toUnit24(view) {
  const uint8 = new Uint8Array(new ArrayBuffer(4))
  uint8.set(new Uint8Array(view.buffer), 0)
  const view2 = new DataView(uint8.buffer)
  return view2.getUint32(0, true)
}

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
    case 3: // 24-bit
      return toUnit24(view)
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

// Get raw data for all fields.
// data should be a Uint8Array
const getFieldData = curry((data, field) => {
  // Byte boundary just do a split.
  if (field.isText) {
    return new DataView(data.slice(field.byteStart, field.byteEnd).buffer)
  }
  if (field.byteEnd) {
    // if (field.byteLength === 1) return data[field.byteStart]
    return toPrecise(
      new DataView(data.slice(field.byteStart, field.byteEnd).buffer),
      field.signed,
      field.resolution,
      field.isNumber,
    )
  }
  // Under 8 bits and within a byte boundary.
  if (field.withinByte) {
    return subByteLE(data[field.byteStart], field.bitStart, field.bitLength)
  }
  if (field.byteLength || field.bitLength > 32) {
    const value = getDataView(data, field.bitOffset, field.bitLength)
    return toPrecise(value, field.signed, field.resolution)
  }
  // Check that buffer is large enough. Is there a better way to do this?
  const bytesNeeded = Math.ceil((field.bitLength + field.bitOffset) / 8)
  if (bytesNeeded > data.byteLength) return null // Is this the result?

  // Values under 32 bits and between bytes. Attempt to get number?
  // @TODO replace with eventual get-bits function.
  const bv = new BitView(data.buffer)
  return bv.getBits(field.bitOffset, field.bitLength)
})
// Calculate the field dataPositions.
function variableFieldPositions(data, fields) {
  let bitPosition = 0
  const getPosition = dataPosition()
  return fields.map((field) => {
    if (startLengthByte(field.type)) {
      const byteLength = data[bitPosition / 8]
      const bitLength = byteLength * 8
      bitPosition += bitLength
      return getPosition({ ...field, byteLength, bitLength })
    }
    bitPosition += field.bitLength
    return getPosition(field)
  })
}
function getFieldInfo(data, info) {
  if (info.variableLength) return variableFieldPositions(data, info.fields)
  return info.fields
}

// Get raw data for all fields.
// input.data should be an Uint8Array
function splitPgn(data, info) {
  const fieldInfo = getFieldInfo(data, info)
  const fieldData = map(getFieldData(data), fieldInfo)
  // Figure out how many sets of repeating fields. Repeat field definitions.
  return fieldData
}

// Add fieldData and info fields to input.
// info is result of getPgnInfo(input)
function addInfoFieldData(input, info) {
  if (!info.hasOptions) {
    return { ...input, info, fieldData: splitPgn(input.data, info) }
  }
  // Has options. Need to find correct info option. Get fieldData at same time.
  // @TODO Process proprietary generic first and match industry + mfg codes.
  let fieldData = null
  function tryOption(infoOption) {
    fieldData = splitPgn(input.data, infoOption)
    return infoOption.isMatch(fieldData)
  }
  const infoMatch = info.options.find(tryOption)
  return { ...input, info: infoMatch, fieldData }
}

// Probably should be getPgnInfo(), input, state where state is optional.
function parse(getPgnInfo, state, input) {
  const info = getPgnInfo(input)
  if (!info) {
    console.error('No PGN info available!', input)
    return input
  }
  if (info.singleFrame || input.dataReady) {
    return addInfoFieldData(input, info)
  }
  // multi-frame
  const { data, ...seqState } = restoreFastPacket(input, state)
  if (data) {
    delete seqState.frames
    return addInfoFieldData({ ...input, data, seqState }, info)
  }
  return { ...input, info, seqState }
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
  toUnit24,
}
