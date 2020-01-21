const { curry, isEmpty } = require('lodash/fp')
const { BitView } = require('bit-buffer')
const { fromPrecise } = require('./numbers')

// Return buffer that contains data.
const getFieldData = curry((input, bv, fieldInfo) => {
  const { id } = fieldInfo
  const value = input.field[id]
  // What value is undefined?
  fromPrecise(bv, value, fieldInfo)
  return bv
})

// Encode PGN Data
const encode = curry((getPgnInfo, input) => {
  if (isEmpty(input.field)) {
    console.error('Must contain field object.')
    return input
  }
  const info = getPgnInfo(input)
  if (!info) {
    console.error('No PGN info available!', input)
    return input
  }
  const bv = new BitView(new ArrayBuffer(info.byteLength))
  // Is it worth saving the field values after resolution conversion?
  const bitview = info.fields.reduce(getFieldData(input), bv)
  // console.log(info.name, info.byteLength, bitview.buffer)
  // Create new buffer to contain our data.
  // const data = new ArrayBuffer(info.byteLength)
  return {
    prio: info.priority,
    ...input,
    info,
    // fieldData,
    data: bitview.buffer,
  }
})

module.exports = {
  encode,
}
