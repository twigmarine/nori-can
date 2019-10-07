const {
  at, conforms, defaults, eq, flow, first, get, groupBy, has, inRange,
  map, multiply, overEvery, overSome, toNumber, update,
} = require('lodash/fp')
const {
  divideBy, hasSize, isGt, isLt, onTrue,
} = require('understory')
const {
  replaceField, setField, updateWith,
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
const isByteSize = (field) => !field.bytes && mod8(field.bitLength)

function dataPosition() {
  let bitPosition = 0
  return (field) => {
    const bitOffset = field.bitOffset || bitPosition
    const bitStart = field.bitStart || bitOffset % 8
    const byteStart = bitOffset / 8 | 0

    bitPosition += field.bitLength
    const res = {
      ...field,
      bitOffset,
      bitStart,
      byteStart,
      withinByte: (field.bitLength + bitStart) < 9,
    }
    if (res.bytes) res.byteEnd = byteStart + field.bytes
    return res
  }
}

const fixEnum = flow(update('value', toNumber), at(['value', 'name']))
const enumValues = flow(
  map(fixEnum),
  (x) => new Map(x),
)

// Individual field info.
// Initialize for each PGN then call the returned function for each field.
const fixField = () => flow(
  defaults(fieldDefaults),
  onTrue(isNameUsed(), uniqueName()), // Append with unique ID.
  replaceField('enumValues', enumValues),
  replaceField('resolution', Number.parseFloat),
  onTrue(has('bytes'), updateWith('bitLength', 'bytes', multiply(8))),
  onTrue(isByteSize, updateWith('bytes', 'bitLength', divideBy(8))),
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
  length: 8, // bytes
  repeatingFields: 0,
}

// Check to see if it might be a multi packet.
const isPossibleMulti = overEvery([
  hasSize, // Not empty.
  conforms({ Length: isGt(8) }), // Some have pgnD.Length > 8.
  // Check for RepeatingFields.
])
const isSingleSize = conforms({
  length: isLt(9),
  repeatingFields: eq(0),
})
// I don't think this should be a thing.
// 60416 and 60416 RTS are defined incorrectly.
const isSingleRepeat = conforms({
  length: isLt(9),
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
  isProprietarySingle,
  isSingleSize,
  isSingleRepeat,
])
const fixPgn = flow(
  humps,
  defaults(pgnDefault),
  update('fields', fixFields),
  // setField('couldBeMulti', isPossibleMulti),
  setField('singleFrame', isSingle),
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
// const proprietaryDefault = {
//   complete: false,
//   id: 'UnknownProprietary',
//   description: 'Unknown Proprietary',
// }

const basicGetPgnInfo = (pgnMap) => flow(
  get('pgn'),
  (x) => pgnMap.get(x),
  first,
  // add proprietyDefault
)

module.exports = {
  basicGetPgnInfo,
  createPgnMap,
  createGetInfo: flow(createPgnMap, basicGetPgnInfo),
  createGetPgn,
  createGetPgn0,
  field2Arr,
  fixField,
  fixFields,
  fixPgn,
  isPossibleMulti,
  isProprietaryMulti,
  isProprietarySingle,
  isPgnProprietary,
}
