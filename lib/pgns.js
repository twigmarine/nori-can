const {
  at, conforms, curry, defaults, defaultTo, eq,
  filter, flow, get, groupBy, has,
  inRange, isEmpty, isMatch, isPlainObject,
  keyBy, map, multiply, noop, overEvery, overSome, propertyOf,
  set, some, sumBy, toNumber, update, zipObject,
} = require('lodash/fp')

const {
  divideBy, hasSize, isGt, isLt, oneOf, onTrue,
} = require('understory')
const {
  addField, doProp, replaceField, setField, setWith, updateWith,
} = require('prairie')
const humps = require('lodash-humps')
const { categoryDefaultPriority, industryCodes } = require('./codes')
const { hexByte } = require('./utilities')

/* eslint no-bitwise: 0 */
const newMap = (x) => new Map(x)

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

function dataPosition(position = 0) {
  let bitPosition = position
  let order = 1
  return (field) => {
    const bitOffset = bitPosition
    const bitStart = field.bitStart || bitOffset % 8
    const byteStart = bitOffset / 8 | 0

    bitPosition += field.bitLength
    const res = {
      ...field,
      order: field.order || order, // Is this really needed?
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

const fixEnum = onTrue(
  isPlainObject,
  flow(update('value', toNumber), at(['value', 'name'])),
)

const startLengthByte = propertyOf({
  'ASCII or UNICODE string starting with length and control byte': true,
  'ASCII string starting with length byte': true,
})
const variableFieldTypes = propertyOf({
  'String with start/stop byte': true,
})
const fixedTxtFields = oneOf([
  'ASCII text',
])
const variableTxtFields = overSome([variableFieldTypes, startLengthByte])
const isText = overSome([fixedTxtFields, variableTxtFields])
const isVarField = variableTxtFields // only this one for now.
// Figure out if pgn has variable length fields.
const hasVariableFields = some(doProp(isVarField, 'type'))

function checkText(field) {
  if (isText(field.type)) return { ...field, isText: true }
  return field
}
const fieldDataFixes = (position) => flow(
  onTrue(has('byteLength'), updateWith('bitLength', 'byteLength', multiply(8))),
  onTrue(isByteSize, updateWith('byteLength', 'bitLength', divideBy(8))),
  checkText,
  dataPosition(position),
)
const differentiates = onTrue(
  flow(get('id'), oneOf(['source', 'instance', 'pgn'])),
  set('differentiates', true),
)
// Individual field info.
// Initialize for each PGN then call the returned function for each field.
const fixField = () => flow(
  defaults(fieldDefaults),
  onTrue(isNameUsed(), uniqueName()), // Append with unique ID.
  replaceField('enumValues', map(fixEnum)),
  replaceField('resolution', Number.parseFloat),
  fieldDataFixes(0),
  differentiates,
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
const getByteLength = flow(sumBy('bitLength'), divideBy(8), Math.ceil)

// Check to see if it might be a multi packet.
const isPossibleMulti = overEvery([
  hasSize, // Not empty.
  conforms({ Length: isGt(8) }), // Some have pgnD.Length > 8.
  // Check for RepeatingFields.
])
const isSingleSize = conforms({
  byteLength: isLt(9),
  repeatingFields: eq(0),
  variableLength: eq(false),
})

// I don't think this should be a thing.
// 60416 RTS are defined incorrectly.
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
// Check if the PGN is known to be proprietary.
const isPgnProprietary = overSome([isProprietarySingle, isProprietaryMulti])
const isSingle = overSome([
  doProp(isProprietarySingle, 'pgn'),
  isSingleSize,
  isSingleRepeat,
])
const getPriority = flow(
  get('category'),
  propertyOf(categoryDefaultPriority),
  defaultTo(7),
)

const getUniqueFields = flow(
  filter(get('differentiates')),
  map('id'),
  onTrue(isEmpty, noop),
)
const getMatchFields = flow(
  filter(has('match')),
  map('id'),
  (x) => (x.length ? x : undefined),
)
// Path to match value of each field.
const matchPaths = map((x) => [x, 'match'])
const getMatch = ({ matchFields, fields }) => flow(
  keyBy('id'),
  at(matchPaths(matchFields)),
  zipObject(matchFields),
)(fields)
const fixPgn = flow(
  humps,
  defaults(pgnDefault),
  setWith('pgnHex', 'pgn', hexByte),
  update('fields', fixFields),
  setWith('byteLength', 'fields', getByteLength),
  // update length,
  // setField('couldBeMulti', isPossibleMulti),
  setWith('variableLength', 'fields', hasVariableFields),
  setWith('uniqueOn', 'fields', getUniqueFields),
  setField('singleFrame', isSingle),
  setWith('proprietary', 'pgn', isPgnProprietary),
  addField('priority', getPriority),
  setWith('matchFields', 'fields', getMatchFields),
  onTrue(get('matchFields'), setField('match', getMatch)),
)

const canboatPgnMap = flow(
  get('PGNs'),
  map(fixPgn),
  groupBy('pgn'),
)

// Should be able to build default info for proprietary messages.
const proprietaryDefault = {
  complete: false,
  id: 'UnknownProprietary',
  name: 'Unknown Proprietary',
  description: 'Unknown Proprietary',
  category: 'Proprietary',
  proprietary: true,
  priority: 7,
  fields: [
    {
      id: 'manufacturerCode',
      name: 'Manufacturer Code',
      bitLength: 11,
      type: 'Manufacturer code',
    },
    {
      id: 'reserved',
      name: 'Reserved1',
      bitLength: 2,
    },
    {
      id: 'industryCode',
      name: 'Industry Group',
      bitLength: 3,
      enumValues: industryCodes,
    },
  ],
}

const prepField = replaceField('enumValues', newMap)

const prepPgn = flow(
  update('fields', map(prepField)),
  update('uniqueOn', map((x) => ([x, 'value']))),
)
const getProprietary = flow(
  defaults(proprietaryDefault),
  fixPgn,
  prepPgn,
  setWith('singleFrame', 'pgn', isProprietarySingle),
  setWith('multiFrame', 'pgn', isProprietaryMulti),
)

const findPgnInfo = curry((pgnMap, pgn) => {
  const info = pgnMap.get(pgn)
  if (info) return info
  if (isPgnProprietary(pgn)) return getProprietary({ pgn })
  return {
    pgn, id: 'notFound', byteLength: 0, fields: [],
  }
})
const basicGetPgnInfo = (pgnMap) => flow(
  get('pgn'),
  findPgnInfo(pgnMap),
)

const prepOption = setField('isMatch', ({ fields, match }) => flow(
  zipObject(map('id', fields)),
  // (x) => { console.log(x, match); return x },
  isMatch(match),
))

function prepMatchOptions(pgnInfoOptions) {
  return ({
    singleFrame: pgnInfoOptions[0].singleFrame, // Sufficient?
    hasOptions: true,
    options: pgnInfoOptions.map(prepOption),
  })
}
function prepInfo(pgnInfoOptions) {
  if (pgnInfoOptions.length === 1) {
    if (!pgnInfoOptions[0].matchFields) return pgnInfoOptions[0]
    if (pgnInfoOptions[0].proprietary) {
      pgnInfoOptions.push(getProprietary({ pgn: pgnInfoOptions[0].pgn }))
    }
  }
  return prepMatchOptions(pgnInfoOptions)
}
const prepPgns = flow(
  map(prepPgn),
  (x) => [x[0].pgn, prepInfo(x)], // This will throw an error if not found.
  // (x) => {
  //   console.log(x[0])
  //   return x
  // },
)
const createPgnMap = flow(map(prepPgns), newMap)
// Send it an array of arrays.
const createGetInfo = flow(createPgnMap, basicGetPgnInfo)
const canboatGetInfo = flow(canboatPgnMap, createGetInfo)

module.exports = {
  basicGetPgnInfo,
  canboatPgnMap,
  createPgnMap,
  canboatGetInfo,
  createGetInfo,
  dataPosition,
  fieldDataFixes,
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
  prepMatchOptions,
  startLengthByte,
}
