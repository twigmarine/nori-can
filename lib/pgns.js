const {
  at, conforms, defaults, eq, filter, flow, first, get, groupBy, has, inRange, isArray, isEmpty,
  map, multiply, overEvery, overSome, propertyOf, set, toNumber, update, values,
} = require('lodash/fp')
const {
  divideBy, hasSize, isGt, isLt, oneOf, onTrue,
} = require('understory')
const {
  doProp, replaceField, setField, transformHas, updateToWhen, updateWith,
} = require('prairie')
const humps = require('lodash-humps')

const isNameUsed = () => {
  const nameIndex = { Unknown: true, Reserved: true }
  return (field) => {
    if (nameIndex[field.Name]) return true
    nameIndex[field.Name] = true
    return false
  }
}

// Starts a new counter. Returns function that will update Name property.
// Should this also replace the id field?
function uniqueName() {
  const nameCount = {}
  return field => {
    if (!nameCount[field.Name]) nameCount[field.Name] = 1
    field.Name = `${field.Name}${nameCount[field.Name]++}` // eslint-disable-line no-plusplus
    return field
  }
}
const fieldDefaults = {
  BitLength: 8,
  BitStart: 0,
  Id:" unknown",
  Name: "Unknown",
  Signed: false,
  Resolution: 1,
  Offset: 0,
}

const mod8 = x => x % 8 === 0
const isByteSize = field => !field.Bytes && mod8(field.BitLength)

function dataPosition() {
  let bitPosition = 0
  return (field) => {
    if (!field.BitOffset) field.BitOffset = bitPosition
    if (!field.BitStart) field.BitStart = field.BitOffset % 8
    field.ByteStart = field.BitOffset / 8 | 0
    bitPosition = bitPosition + field.BitLength
    if (field.Bytes) field.ByteEnd = field.ByteStart + field.Bytes
    field.WithinByte = ((field.BitLength + field.BitStart) < 9)
    return field
  }
}

const fixEnum = flow(update('value', toNumber), at(['value', 'name']))
const enumValues = flow(
  map(fixEnum),
  x => new Map(x),
)

// Individual field info.
// Initialize for each PGN then call the returned function for each field.
const fixField = () => flow(
  // humps,
  defaults(fieldDefaults),
  onTrue(isNameUsed(), uniqueName()), // Append with unique ID.
  replaceField('EnumValues', enumValues),
  replaceField('Resolution', Number.parseFloat),
  onTrue(has('Bytes'), updateWith('BitLength', 'Bytes', multiply(8))),
  onTrue(isByteSize, updateWith('Bytes', 'BitLength', divideBy(8))),
  dataPosition(),
)

const field2Arr = onTrue(has('Field'), flow(get('Field'), Array))
// Field prop on pgn.
const fixFields = flow(
  field2Arr, // If has 'Field' property, convert it to array.
  // x => { console.log(x); return x },
  fields => map(fixField(), fields), // Process each field individually.
)

// Individual pgn info.
const pgnDefault = {
  Complete: false,
  Length: 8, // bytes
  RepeatingFields: 0,
}

// Check to see if it might be a multi packet.
const isPossibleMulti = overEvery([
  hasSize, // Not empty.
  conforms({ Length: isGt(8) }), // Some have pgnD.Length > 8.
  // Check for RepeatingFields.
])
const isSingleSize = conforms({
  Length: isLt(9),
  RepeatingFields: eq(0),
})
// I don't think this should be a thing.
// 60416 and 60416 RTS are defined incorrectly.
const isSingleRepeat = conforms({
  Length: isLt(9),
  RepeatingFields: isGt(0),
  PGN: isLt(0xFFFF), // Is this sufficient? Hopefully not required.
})

// ISO multi-packet or NMEA Network Message fast-packet protocols
const isProprietaryMulti = overSome([
  eq(0x1EF00), // Destination Addressable
  inRange(0x1FF00, 0x1FFFF + 1), // Global
])
// Single Frame Global
const isProprietarySingle = overSome([
  eq(0xEF00), // Destination Addressable
  inRange(0xFF00, 0xFFFF + 1), // Global
])
// Check if the PGN is known to be propriety.
const isPgnProprietary = overSome([ isProprietarySingle, isProprietaryMulti ])
const isSingle = overSome([
  isProprietarySingle,
  isSingleSize,
  isSingleRepeat,
])
const fixPgn = flow(
  defaults(pgnDefault),
  update('Fields', fixFields),
  // setField('couldBeMulti', isPossibleMulti),
  setField('singleFrame', isSingle),
  humps
)

const createPgnMap = flow(
  get('PGNs'),
  map(fixPgn),
  groupBy('pgn'),
  map(x => [x[0].pgn, x]),
  x => new Map(x)
)

// Should be able to build default info for propriety messages.
const proprietaryDefault = {
  complete: false,
  id: 'UnknownProprietary',
  description: "Unknown Proprietary",
}
const basicGetPgnInfo = pgnMap => flow(
  get('pgn'),
  x => pgnMap.get(x),
  first,
  // add proprietyDefault
)

module.exports = {
  createPgnMap,
  basicGetPgnInfo,
  field2Arr,
  fixField,
  fixFields,
  fixPgn,
  isProprietaryMulti,
  isProprietarySingle,
  isPgnProprietary,
}
