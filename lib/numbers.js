const {
  identity, isNumber, noop,
} = require('lodash/fp')
// const { setField } = require('prairie')
const { Int64LE, Uint64LE } = require('int64-buffer')
const Big = require('big.js')
const { isReserved } = require('./pgns')
const { dataViewEqual, hexStrBuff } = require('./utilities')

const getMaxUint = (bits) => (2 ** bits) - 1
function createNumInfo(bytes, toInt, fromInt, toUint, fromUint) {
  const bits = bytes * 8
  const maxUintVal = getMaxUint(bits)
  const maxIntVal = maxUintVal >> 1 // eslint-disable-line no-bitwise
  return {
    bits,
    bytes,
    int: {
      toNum: toInt || identity,
      fromNum: fromInt || identity,
      maxVal: maxIntVal,
    },
    uint: {
      toNum: toUint || identity,
      fromNum: fromUint || identity,
      maxVal: maxUintVal,
    },
  }
}

const toBasicNum = (methodName) => (view) => view[methodName](0, true)

function fromBasicNum(methodName) {
  return (view, offset, num) => {
    // Always round when creating a basic number.
    view[methodName](offset, Math.round(num), true)
    return view.buffer
  }
}
function getBasicNum(bytes) {
  const numInfo = createNumInfo(bytes)
  const { bits } = numInfo
  numInfo.int.toNum = toBasicNum(`getInt${bits}`)
  numInfo.int.fromNum = fromBasicNum(`setInt${bits}`)
  numInfo.uint.toNum = toBasicNum(`getUint${bits}`)
  numInfo.uint.fromNum = fromBasicNum(`setUint${bits}`)
  return numInfo
}

// Numbers Conversion
const numMap = new Map([1, 2, 4].map((bytes) => [bytes, getBasicNum(bytes)]))
numMap.set(0, createNumInfo(0, noop, noop, noop, noop))

function toUint24(view) {
  const uint8 = new Uint8Array(new ArrayBuffer(4))
  uint8.set(new Uint8Array(view.buffer), 0)
  const view2 = new DataView(uint8.buffer)
  return view2.getUint32(0, true)
}
function fromUint24(view, bitOffset, num) {
  return view.setBits(bitOffset, num, 24)
}
numMap.set(3, createNumInfo(3, undefined, undefined, toUint24, fromUint24))

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
numMap.set(8, createNumInfo(8, toInt64, undefined, toUint64, undefined))

function fromNumber(view, num, fieldInfo) {
  const {
    bitOffset, bitLength, byteLength, signed,
  } = fieldInfo
  if (isReserved(fieldInfo)) return view.setBits(bitOffset, getMaxUint(bitLength), bitLength)
  if (!byteLength) { // Bits
    return view.setBits(bitOffset, num, bitLength)
  }
  const numInfo = numMap.get(byteLength)
  // @TODO Will need to handle floats eventually.
  // Round number to nearest whole.
  const func = numInfo[signed ? 'int' : 'uint'].fromNum
  // if (num === null) return numInfo.maxBuffer
  return func(view, bitOffset, num)
}

// @TODO Will need to handle float32, float64, float80
function fromPrecise(view, num, fieldInfo) {
  const { resolution } = fieldInfo
  if (resolution && resolution !== 1) {
    return fromNumber(view, parseFloat(new Big(num).div(resolution)), fieldInfo)
  }
  return fromNumber(view, num, fieldInfo)
}

// Process number and return null if maxVal.
// @TODO Will need to handle float32, float64, float80
function toNumber(view, signed) {
  const byteInfo = numMap.get(view.byteLength)
  if (!byteInfo) return view
  const numInfo = signed ? byteInfo.int : byteInfo.uint
  if (!numInfo) {
    console.error('not found', view.byteLength)
    return view
  }
  const numVal = numInfo.toNum(view)
  return numVal === numInfo.maxVal ? null : numVal
}

function toPrecise(view, signed, resolution) {
  // 1e-16 === Math.pow(10, -16) max 15 decimal places
  const num = toNumber(view, signed)
  if (resolution && resolution !== 1) {
    // Using Big because of javascript decimal errors. 15300000 * 1e-6 !== 15.3
    // Maybe there is a way to figure out if its use is required?
    // Shouldn't it be a number by now?!? Why do we need a check
    if (isNumber(num)) return parseFloat(new Big(num).times(resolution))
  }
  return num
}

module.exports = {
  fromNumber,
  fromPrecise,
  getMaxUint,
  numMap,
  toNumber,
  toPrecise,
}
