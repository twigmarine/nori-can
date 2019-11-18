const {
  at, camelCase, conforms, curry, defaults, defaultTo, eq,
  filter, flow, get, groupBy, has,
  inRange, isEmpty, isMatch, isPlainObject,
  keyBy, map, matches, multiply, negate, noop, overEvery, overSome, propertyOf,
  set, some, sumBy, toNumber, update, upperFirst, zipObject,
} = require('lodash/fp')

const {
  divideBy, hasSize, isGt, isLt, oneOf, onTrue,
} = require('understory')
const {
  addField, doProp, propDo, replaceField, setField, setWith, updateWith,
} = require('prairie')
const humps = require('lodash-humps')
const { categoryDefaultPriority, industryCodes } = require('./codes')
const { hexByte } = require('./utilities')

/* eslint no-bitwise: 0 */
const newMap = (x) => new Map(x)

const isIdUsed = () => {
  const nameIndex = { }
  return (field) => {
    if (nameIndex[field.id]) return true
    nameIndex[field.id] = true
    return false
  }
}

// Starts a new counter. Returns function that will update Name property.
// Should this also replace the id field?
function uniqueId() {
  const nameCount = {}
  return (field) => {
    if (!nameCount[field.id]) nameCount[field.id] = 1
    return {
      ...field,
      id: `${field.id}${nameCount[field.id]++}`, // eslint-disable-line no-plusplus
    }
  }
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
const fieldDefaults = {
  bitLength: 8,
  bitStart: 0,
  signed: false,
  // resolution: 1,
  // offset: 0,
}

// const titleize = flow(lowerCase, startCase)
function fixIdName(field) {
  const { id } = field
  if (field.name === 'nItems') return field
  const name = upperFirst(field.name)
  if (id && name) return { ...field, name }
  if (id && !name) return { ...field, name: upperFirst(field.id) }
  if (!id && field.name) return { ...field, id: camelCase(field.name), name }
  return { ...field, id: 'unknown', name: 'Unknown' }
}
// Initialize for each PGN then call the returned function for each field.
const fixField = () => flow(
  defaults(fieldDefaults),
  fixIdName,
  onTrue(isIdUsed(), uniqueId()), // Append with unique number.
  replaceField('enumValues', map(fixEnum)),
  replaceField('resolution', Number.parseFloat),
  fieldDataFixes(0),
  // onTrue(nullPossible, setWith('nullValue', )),
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
  conforms({ byteLength: isGt(8) }), // Some have pgnD.Length > 8.
  // Check for RepeatingFields.
])
const isSingleSize = conforms({
  byteLength: isLt(9),
  repeatingFields: eq(0),
  variableLength: eq(false),
  proprietary: eq(false),
})
// I don't think this should be a thing.
// 60416 RTS are defined incorrectly.
const isSingleRepeat = conforms({
  byteLength: isLt(9),
  repeatingFields: isGt(0),
  pgn: isLt(0xFFFF), // Is this sufficient? Hopefully not required.
})

// ISO multi-packet or NMEA Network Message fast-packet protocols.
// NOTE: Not always true. Sometimes 0x1EF00 is single frame. Why?
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
const isProprietary = overSome([isProprietarySingle, isProprietaryMulti])
const isKnownSingle = matches({ complete: true, singleFrame: true })
const isKnownMulti = matches({ complete: true, singleFrame: false })
const isSingle = overEvery([
  negate(isKnownMulti),
  overSome([
    doProp(isProprietarySingle, 'pgn'),
    isKnownSingle,
    isSingleSize,
    isSingleRepeat,
  ]),
])
const getPriority = flow(
  get('category'),
  propertyOf(categoryDefaultPriority),
  defaultTo(7),
)
const addPriority = addField('priority', getPriority)

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
const addCategory = ({ proprietary }) => (proprietary ? 'Proprietary' : 'Unknown')
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
  setWith('proprietary', 'pgn', isProprietary),
  addField('category', addCategory),
  setField('singleFrame', isSingle),
  addPriority,
  setWith('matchFields', 'fields', getMatchFields),
  onTrue(get('matchFields'), setField('match', getMatch)),
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

const prepOption = setField('isMatch', ({ fields, match }) => flow(
  zipObject(map('id', fields)),
  // (x) => { console.log(x, match); return x },
  isMatch(match),
))

// We have more than one definition for the pgn.
function prepMatchOptions(pgnInfoOptions) {
  const { singleFrame } = pgnInfoOptions[0]
  return ({
    singleFrame, // Sufficient?
    hasOptions: true,
    options: pgnInfoOptions.map(prepOption),
  })
}

// Prep pgn info for use in processing CAN messages.
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
)

function createDefaultInfo(pgn) {
  // Make generic proprietary info.
  if (isProprietary(pgn)) return getProprietary({ pgn })
  // No match.
  return {
    pgn, id: 'notFound', byteLength: 0, fields: [],
  }
}

/**
 * Load up info for pgn.
 * @type {function}
 */
const findPgnInfo = curry((pgnMap, pgn) => pgnMap.get(pgn) || createDefaultInfo(pgn))
const createPgnMap = flow(map(prepPgns), newMap, findPgnInfo)
// Send it an array of arrays.
const createGetInfo = flow(createPgnMap, propDo('pgn'))

const canboatPgnMap = flow(
  get('PGNs'),
  map(fixPgn),
  groupBy('pgn'),
)
const canboatGetInfo = flow(canboatPgnMap, createGetInfo)

module.exports = {
  addPriority,
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
  getPriority,
  getProprietary,
  isPossibleMulti,
  isProprietary,
  isProprietaryMulti,
  isProprietarySingle,
  isPgnProprietary: isProprietary,
  isSingle,
  isText,
  prepMatchOptions,
  prepPgn,
  startLengthByte,
}
