const {
  cond, constant, eq, flow, isEmpty, pick, set, startsWith, update,
} = require('lodash/fp')
const {
  mergeFieldsWith, mergeWith, setField, setWith,
} = require('prairie')
const { getClass, getManufacturerName } = require('./codes')
const { buffStr, buffStr16, dataStr } = require('./utilities')
// const { toNumber } = require('./parsePgn')

// function binToStr(binary) {
//   if (binary instanceof DataView) return buffHexStr(binary.buffer, ',')
//   if (binary && binary.toString) return binary.toString(16)
//   return binary
// }
function getEncoding(num) {
  if (num === 0) return 'UTF-16'
  if (num === 1) return 'ASCII'
  return `UNKNOWN (${num})`
}
const asciiUniVal = [buffStr16, buffStr]

function asciiUni(field) {
  const val = field.value
  if (val.byteLength === 0) return { ...field, bitLength: 0, value: null }
  const byteLength = val.byteLength - 2
  const encoding = val.getUint8(1)
  const stringData = val.buffer.slice(2)
  const decoder = byteLength && asciiUniVal[encoding]
  return {
    ...field,
    byteLength,
    bitLength: byteLength * 8,
    encoding,
    encodingLabel: getEncoding(encoding),
    stringData: decoder || !byteLength ? undefined : stringData,
    value: decoder ? decoder(stringData) : null,
  }
}
const fieldTypes = {
  'ASCII text': update('value', dataStr),
  'ASCII or UNICODE string starting with length and control byte': asciiUni,
  // 'Binary data': update('value', binToStr),
  // Integer: update('value', toNumber),
  'Manufacturer code': setWith('label', 'value', getManufacturerName),
}

const classFunFields = pick(['label', 'labelDetails', 'deprecated'])
const devClassInfo = flow(getClass, classFunFields)

const vhfTxSimplex = cond([
  [eq('0'), constant({ label: 'Tx Status Unkown', value: 0 })],
  [eq('1'), constant({ label: 'Ship Tx Simplex', value: 1 })],
  [eq('2'), constant({ label: 'Coast Tx Simplex', value: 2 })],
])
const vhfChannel = (str) => ({
  type: 'VHF',
  simplex: vhfTxSimplex(str[2]),
  channel: str.slice(3),
  value: str,
})
const radioChannelInfo = flow(
  dataStr,
  cond([
  // [startsWith("3"), mfPhone],
  // [startsWith("4"), mfTeletype],
    [startsWith('90'), vhfChannel],
  ]),
)

// @TODO move to pgns.js
const fieldIds = {
  deviceClass: mergeFieldsWith('value', devClassInfo),
  radioChannel: mergeFieldsWith('value', radioChannelInfo),
}
const processTypes = (id, x) => {
  if (fieldIds[id]) return fieldIds[id](x) // Remove this eventually?
  if (fieldTypes[x.type]) return fieldTypes[x.type](x)
  return x
}

function getFieldValue(field, rawValue) {
  if (!field.enumValues && field.bitLength === 1) return !!rawValue
  return rawValue
}
const devFuncInfo = ({ deviceClass, deviceFunction }) => mergeWith(
  deviceFunction,
  classFunFields(getClass(deviceClass.value).getFunction(deviceFunction.value)),
)

function postProcess(field) {
  if (field.deviceFunction && field.deviceClass) {
    return set(
      'deviceFunction',
      devFuncInfo(field),
      field,
    )
  }
  return field
}
// data has been split into an array with raw number values
// now we want to start adding in field information.
function getFields(packet) {
  const data = packet.fieldData
  if (isEmpty(data)) return null
  // console.log(packet)
  const res = packet.info.fields.reduce((accumulator, currentField, index) => {
    const field = pick(
      ['bitLength', 'type', 'description', 'name', 'units', 'resolution'],
      currentField,
    )
    if (field.resolution === 1) delete field.resolution
    field.value = getFieldValue(currentField, data[index])
    if (currentField.enumValues) {
      field.label = currentField.enumValues.get(field.value)
    }
    accumulator[currentField.id] = processTypes(currentField.id, field)
    return accumulator
  }, {})
  return postProcess(res)
}
// Add `field` prop to parsed result.
const addFields = setField('field', getFields)

module.exports = {
  addFields,
  getFields,
}
