const { curry, isEmpty, isPlainObject } = require('lodash/fp')
const { BitView } = require('bit-buffer')
const { addCanId } = require('./canId')
const { fromPrecise } = require('./numbers')

// Return buffer that contains data.
const getFieldData = curry((input, bv, fieldInfo) => {
  const { id, match } = fieldInfo
  // Override field value with match value.
  const value = match || (isPlainObject(input.field[id]) ? input.field[id].value : input.field[id])
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

  return addCanId({
    prio: info.priority,
    pgn: info.pgn,
    ...input,
    dst: info.addressable ? input.dst || 0xFF : 0xFF,
    info,
    // fieldData,
    data: Uint8Array.from(bitview.buffer),
  })
})

module.exports = {
  encode,
}
