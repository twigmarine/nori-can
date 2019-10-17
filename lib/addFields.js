const { isEmpty, pick } = require('lodash/fp')
const { setField, setWith } = require('prairie')
const { getManufacturerName } = require('./codes')
// const { buffHexStr } = require('./utilities')
// const { toNumber } = require('./parsePgn')

// function binToStr(binary) {
//   if (binary instanceof DataView) return buffHexStr(binary.buffer, '')
//   if (binary && binary.toString) return binary.toString(16)
//   return binary
// }

const fieldTypes = {
  // 'Binary data': update('value', binToStr),
  // Integer: update('value', toNumber),
  'Manufacturer code': setWith('label', 'value', getManufacturerName),
}
const processTypes = (x) => (fieldTypes[x.type] ? fieldTypes[x.type](x) : x)

function getFieldValue(field, rawValue) {
  if (!field.enumValues && field.bitLength === 1) return !!rawValue
  return rawValue
}

// data has been split into an array with raw number values
// now we want to start adding in field information.
function getFields(packet) {
  const data = packet.fieldData
  if (isEmpty(data)) return null
  // console.log(packet)
  return packet.info.fields.reduce((accumulator, currentField, index) => {
    const field = pick(
      ['bitLength', 'type', 'description', 'name', 'units', 'resolution'],
      currentField,
    )
    if (field.resolution === 1) delete field.resolution
    field.value = getFieldValue(currentField, data[index])
    if (currentField.enumValues) {
      field.label = currentField.enumValues.get(field.value)
    }
    accumulator[currentField.id] = processTypes(field)
    return accumulator
  }, {})
}
// Add `field` prop to parsed result.
const addFields = setField('field', getFields)

module.exports = {
  addFields,
  getFields,
}
