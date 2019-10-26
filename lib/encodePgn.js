const { curry, isEmpty, map } = require('lodash/fp')
const { fromNumber, u8Concat } = require('./')

// Return buffer that contains data.
const getFieldData = curry((input, { byteLength, id, signed }) => {
  if (byteLength) {
    return fromNumber(input.field[id], byteLength, signed)
  }
  return undefined
})

// Encode PGN Data
function encode(getPgnInfo, input) {
  if (isEmpty(input.field)) {
    console.error('Must contain field object.')
    return input
  }
  const info = getPgnInfo(input)
  if (!info) {
    console.error('No PGN info available!', input)
    return input
  }
  const fieldData = map(getFieldData(input), info.fields)
  const data = u8Concat(fieldData)
  // Create new buffer to contain our data.
  // const data = new ArrayBuffer(info.byteLength)
  return {
    ...input, info, fieldData, data,
  }
}

module.exports = {
  encode,
}
