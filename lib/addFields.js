const {
  at, cond, constant, eq, flow, get, isEmpty,
  map, over, pick, set, spread, startsWith, update, zipObject,
} = require('lodash/fp')
const { onTrue } = require('understory')
const {
  mergeFieldsWith, mergeWith, setField, setWith,
} = require('prairie')
const { getClass, getManufacturerName } = require('./codes')
const {
  buffStr, buffStr16, dataStr, hexByte,
} = require('./utilities')
const { getMaxUint } = require('./numbers')
// const { toNumber } = require('./parsePgn')

// function binToStr(binary) {
//   if (binary instanceof DataView) return byteString(binary.buffer, ',')
//   if (binary && binary.toString) return binary.toString(16)
//   return binary
// }
function getEncoding(num) {
  if (num === 0) return 'UTF-16'
  if (num === 1) return 'ASCII'
  return `UNKNOWN (${num})`
}
const asciiUniVal = [buffStr16, buffStr, buffStr]

function asciiUni(field, packet) {
  const val = field.value
  if (val.byteLength === 0) return { ...field, bitLength: 0, value: null }
  const byteLength = val.getUint8(0) - 2
  const control = val.getUint8(1)
  const stringData = val.buffer.slice(2)
  const invalidUni = stringData.byteLength % 2 !== 0
  const encoding = invalidUni ? 1 : control
  // Control byte = 0 => Unicode characters
  if (encoding === 0 && invalidUni) {
    // Why is this happening? What do we do?
    console.log(val.byteLength - 2, byteLength, encoding)
    console.error('UNICODE ERR', encoding, stringData, packet)
  }
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
const processTypes = (id, x, packet) => {
  if (fieldIds[id]) return fieldIds[id](x) // Remove this eventually?
  if (fieldTypes[x.type]) return fieldTypes[x.type](x, packet)
  return x
}

function isNullBits(field, val) {
  // Do we want to check for other kinds of null here?
  return field.withinByte && getMaxUint(field.bitLength) === val
}
function getFieldValue(field, rawValue) {
  if (field.bitLength === 1) return !field.enumValues ? !!rawValue : rawValue
  if (isNullBits(field, rawValue)) return null
  return rawValue
}
const devFuncInfo = ({ deviceClass, deviceFunction }) => mergeWith(
  deviceFunction,
  classFunFields(getClass(deviceClass.value).getFunction(deviceFunction.value)),
)
const devInstance = ({ deviceInstanceLower, deviceInstanceUpper }) => ({
  name: 'NMEA Device Instance',
  // eslint-disable-next-line no-bitwise
  value: (deviceInstanceUpper.value << 3) | deviceInstanceLower.value,
})
const hasDevFunc = (field) => (field.deviceFunction && field.deviceClass)
const hasDevInst = (field) => (field.deviceInstanceLower && field.deviceInstanceUpper)
const postProcess = flow(
  onTrue(hasDevFunc, setField('deviceFunction', devFuncInfo)),
  onTrue(hasDevInst, setField('deviceInstance', devInstance)),
)
const fieldProps = pick(['bitLength', 'type', 'description', 'name', 'units', 'resolution'])

// data has been split into an array with raw number values
// now we want to start adding in field information.
function getFields(packet) {
  const data = packet.fieldData
  if (isEmpty(data)) return null
  // console.log(packet)
  const res = packet.info.fields.reduce((accumulator, currentField, index) => {
    // This might slow down things or result in higher memory usage?
    const field = fieldProps(currentField)
    if (field.resolution === 1) delete field.resolution
    field.value = getFieldValue(currentField, data[index])
    if (currentField.enumValues) {
      field.label = currentField.enumValues.get(data[index])
    }
    return set(currentField.id, processTypes(currentField.id, field, packet), accumulator)
  }, packet.field || {})
  return postProcess(res)
}

function getMsgId({ canId, field, info }) {
  if (!info.uniqueOn) return hexByte(canId)
  const keys = [canId, ...at(info.uniqueOn, field)]
  return keys.map(hexByte).join('')
}

// Add `field` prop to parsed result.
const addFields = flow(
  setField('field', getFields),
  setField('msgId', getMsgId),
)

const getFieldIds = flow(get('info.fields'), map('id'))
const getRawFieldValues = flow(
  over([getFieldIds, get('fieldData')]),
  spread(zipObject),
)
module.exports = {
  addFields,
  fieldProps,
  getFields,
  getFieldIds,
  getRawFieldValues,
}
