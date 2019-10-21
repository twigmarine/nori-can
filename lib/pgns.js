const {
  at, conforms, defaults, eq, flow, first, get, groupBy, has, inRange,
  map, multiply, overEvery, overSome, propertyOf, some, sumBy, toNumber, update,
} = require('lodash/fp')
const {
  divideBy, hasSize, isGt, isLt, onTrue,
} = require('understory')
const {
  doProp, replaceField, setField, setWith, updateWith,
} = require('prairie')
const humps = require('lodash-humps')

/* eslint no-bitwise: 0 */

const isNameUsed = () => {
  const nameIndex = { Unknown: true, Reserved: true }
  return (field) => {
    if (nameIndex[field.name]) return true
    nameIndex[field.name] = true
    return false
  }
}

// Starts a new counter. Returns function that will update Name property.
// Should this also replace the id field?
function uniqueName() {
  const nameCount = {}
  return (field) => {
    if (!nameCount[field.name]) nameCount[field.name] = 1
    return {
      ...field,
      name: `${field.name}${nameCount[field.name]++}`, // eslint-disable-line no-plusplus
    }
  }
}
const fieldDefaults = {
  bitLength: 8,
  bitStart: 0,
  id: ' unknown',
  name: 'Unknown',
  signed: false,
  resolution: 1,
  offset: 0,
}

const mod8 = (x) => x % 8 === 0
const isByteSize = (field) => !field.byteLength && mod8(field.bitLength)

function dataPosition() {
  let bitPosition = 0
  let order = 1
  return (field) => {
    const bitOffset = bitPosition
    const bitStart = field.bitStart || bitOffset % 8
    const byteStart = bitOffset / 8 | 0

    bitPosition += field.bitLength
    const res = {
      ...field,
      order: field.order || order,
      bitOffset,
      bitStart,
      byteStart,
      withinByte: (field.bitLength + bitStart) < 9,
    }
    order += 1
    if (res.byteLength) res.byteEnd = byteStart + field.byteLength
    return res
  }
}

const fixEnum = flow(update('value', toNumber), at(['value', 'name']))
const enumValues = flow(
  map(fixEnum),
  (x) => new Map(x),
)

const startLengthByte = propertyOf({
  'ASCII or UNICODE string starting with length and control byte': true,
  'ASCII string starting with length byte': true,
})
const variableFieldTypes = propertyOf({
  'String with start/stop byte': true,
})
const isText = overSome([variableFieldTypes, startLengthByte])
function checkText(field) {
  if (isText(field.type)) return { ...field, isText: true }
  return field
}
// Individual field info.
// Initialize for each PGN then call the returned function for each field.
const fixField = () => flow(
  defaults(fieldDefaults),
  onTrue(isNameUsed(), uniqueName()), // Append with unique ID.
  replaceField('enumValues', enumValues),
  replaceField('resolution', Number.parseFloat),
  onTrue(has('byteLength'), updateWith('bitLength', 'byteLength', multiply(8))),
  onTrue(isByteSize, updateWith('byteLength', 'bitLength', divideBy(8))),
  checkText,
  dataPosition(),
)

const field2Arr = onTrue(has('field'), flow(get('field'), Array))
// Field prop on pgn.
const fixFields = flow(
  field2Arr, // If has 'Field' property, convert it to array.
  // Process each field individually.
  // eslint-disable-next-line lodash-fp/no-extraneous-function-wrapping
  (fields) => map(fixField(), fields),
)

// Individual pgn info.
const pgnDefault = {
  complete: false,
  repeatingFields: 0,
}
const getByteLength = flow(sumBy('bitLength'), divideBy(8))

// Check to see if it might be a multi packet.
const isPossibleMulti = overEvery([
  hasSize, // Not empty.
  conforms({ Length: isGt(8) }), // Some have pgnD.Length > 8.
  // Check for RepeatingFields.
])
const isSingleSize = conforms({
  byteLength: isLt(9),
  repeatingFields: eq(0),
})
// I don't think this should be a thing.
// 60416 and 60416 RTS are defined incorrectly.
const isSingleRepeat = conforms({
  byteLength: isLt(9),
  repeatingFields: isGt(0),
  pgn: isLt(0xFFFF), // Is this sufficient? Hopefully not required.
})

// ISO multi-packet or NMEA Network Message fast-packet protocols
const isProprietaryMulti = overSome([
  eq(0x1EF00), // Destination Addressable
  inRange(0x1FF00, 0x1FFFF + 1), // Global
])
// Single Frame Global
const isProprietarySingle = overSome([
  eq(0xEF00), // Destination Addressable
  inRange(0xFF00, 0xFFFF + 1), // Global
])
// Check if the PGN is known to be propriety.
const isPgnProprietary = overSome([isProprietarySingle, isProprietaryMulti])
const isSingle = overSome([
  doProp(isProprietarySingle, 'pgn'),
  isSingleSize,
  isSingleRepeat,
])

// Figure out if pgn has variable length fields.
const hasVariableFields = some(doProp(isText, 'type'))
const fixPgn = flow(
  humps,
  defaults(pgnDefault),
  update('fields', fixFields),
  setWith('byteLength', 'fields', getByteLength),
  // setField('couldBeMulti', isPossibleMulti),
  setField('singleFrame', isSingle),
  setWith('variableLength', 'fields', hasVariableFields),
)

const createPgnMap = flow(
  get('PGNs'),
  map(fixPgn),
  groupBy('pgn'),
  map((x) => [x[0].pgn, x]),
  (x) => new Map(x),
)
const createGetPgn = (pgns) => {
  const pgnMap = createPgnMap(pgns)
  return (pgnNumber) => pgnMap.get(pgnNumber)
}
const createGetPgn0 = (pgns) => flow(createGetPgn(pgns), first)

// Should be able to build default info for propriety messages.
const proprietaryDefault = {
  complete: false,
  id: 'UnknownProprietary',
  description: 'Unknown Proprietary',
}
const getProprietary = flow(
  defaults(proprietaryDefault),
  setWith('singleFrame', 'pgn', isProprietarySingle),
  setWith('multiFrame', 'pgn', isProprietaryMulti),
)

const basicGetPgnInfo = (pgnMap) => flow(
  get('pgn'),
  (x) => pgnMap.get(x) || [getProprietary(x)],
  first,
)

module.exports = {
  basicGetPgnInfo,
  createPgnMap,
  createGetInfo: flow(createPgnMap, basicGetPgnInfo),
  createGetPgn,
  createGetPgn0,
  dataPosition,
  field2Arr,
  fixField,
  fixFields,
  fixPgn,
  getProprietary,
  isPossibleMulti,
  isProprietaryMulti,
  isProprietarySingle,
  isPgnProprietary,
  isText,
  startLengthByte,
}
