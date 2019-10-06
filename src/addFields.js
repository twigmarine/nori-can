const { isEmpty, pick, update } = require('lodash/fp')
const { setField, setWith } = require('prairie')
const { getManufacturerName } = require('./codes')
const { buffHexStr } = require('./utilities')

const fieldTypes = {
  ['Binary data']: update(
    'value',
    x => x instanceof DataView ? buffHexStr(x.buffer) : x.toString(16)
  ),
  ['Manufacturer code']: setWith('label', 'value', getManufacturerName),
}
const processTypes = x => fieldTypes[x.type] ? fieldTypes[x.type](x) : x

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
const addFields = setField('field', getFields)

module.exports = {
  addFields,
  getFields,
}
