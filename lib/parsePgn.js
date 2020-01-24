const {
  curry, last, map,
} = require('lodash/fp')
// const { setField } = require('prairie')
const { getDataView, subByteLE } = require('get-bits')
const { BitView } = require('bit-buffer')
const { restoreFastPacket } = require('./fastPacket')
const { dataPosition, fieldDataFixes, startLengthByte } = require('./pgns')
const { getMaxUint, toPrecise } = require('./numbers')
// const { fieldProps } = require('./addFields')

function uint32bits(buffer, bitOffset, bitLength) {
  // @TODO replace with eventual get-bits function.
  const bv = new BitView(buffer)
  const num = bv.getBits(bitOffset, bitLength)
  // Do we need to do any resolution adjustments?
  const maxVal = getMaxUint(bitLength)
  return num === maxVal ? null : num
}

// Get raw data for all fields.
// data should be a Uint8Array
const getFieldData = curry((data, field) => {
  // Byte boundary just do a split.
  if (field.isText) {
    return new DataView(data.slice(field.byteStart, field.byteEnd).buffer)
  }
  if (field.byteEnd) {
    // if (field.byteLength === 1) return data[field.byteStart]
    return toPrecise(
      new DataView(data.slice(field.byteStart, field.byteEnd).buffer),
      field.signed,
      field.resolution,
      field.isNumber,
    )
  }
  // Under 8 bits and within a byte boundary.
  if (field.withinByte) {
    return subByteLE(data[field.byteStart], field.bitStart, field.bitLength)
  }
  if (field.byteLength || field.bitLength > 32) {
    const value = getDataView(data, field.bitOffset, field.bitLength)
    return toPrecise(value, field.signed, field.resolution)
  }
  // Check that buffer is large enough. Is there a better way to do this?
  const bytesNeeded = Math.ceil((field.bitLength + field.bitOffset) / 8)
  if (bytesNeeded > data.byteLength) return null // Is this the result?

  // Values under 32 bits and between bytes. Attempt to get number?
  return uint32bits(data.buffer, field.bitOffset, field.bitLength)
})

// Take some input.data and split it up based on field definitions.
const getFieldsData = (input, fields) => map(getFieldData(input.data), fields || input.info.fields)

// Calculate the field dataPositions.
function variableFieldPositions(data, fields) {
  let bitPosition = 0
  const getPosition = dataPosition()
  return fields.map((field) => {
    if (startLengthByte(field.type)) {
      const byteLength = data[bitPosition / 8]
      const bitLength = byteLength * 8
      bitPosition += bitLength
      return getPosition({ ...field, byteLength, bitLength })
    }
    bitPosition += field.bitLength
    return getPosition(field)
  })
}
function extraField(info, byteLength) {
  const prevField = last(info.fields)
  const bitPosition = prevField ? prevField.bitOffset + prevField.bitLength : 0
  const bitLength = (byteLength * 8) - bitPosition
  const dataField = fieldDataFixes(bitPosition)({
    id: 'unkownData',
    name: 'Unkown Binary Data',
    type: 'Binary data',
    bitLength,
  })
  dataField.position = info.fields.length
  return [...info.fields, dataField]
}

function getFieldInfo(data, info) {
  if (info.variableLength) return variableFieldPositions(data, info.fields)
  if (data.byteLength > info.byteLength) return extraField(info, data.byteLength)
  return info.fields
}

// Add found/calculated info and fieldData.
function addDataFields(input, info, fieldData, fields) {
  // Fields are unchanged from original.
  if (info.fields === fields || info.fields) {
    return { ...input, info, fieldData }
  }
  return { ...input, info: { ...info, fields }, fieldData }
}
// Figure out how many sets of repeating fields. Repeat field definitions.
function repeatingFields(input, info, getPgnInfo) {
  const fieldData = getFieldsData(input, info.fields)
  const repFields = info.repeatingFields
  const count = info.fieldIndex.repeatLength ? fieldData[info.fieldIndex.repeatLength.position] : 0
  const addPos = dataPosition(repFields[0].bitOffset, repFields[0].position)
  // Has PGN Defined
  if (info.fieldIndex.pgn) {
    const pgnIndex = info.fieldIndex.pgn.position
    const pgnInfo = getPgnInfo({ pgn: fieldData[pgnIndex] })
    let subInfo = pgnInfo.options ? pgnInfo.options[0] : pgnInfo
    const matchVals = {}
    // Is there always a count if pgn is defined?
    Array(count).forEach(() => { // For every count
      let nextValField = null
      repFields.forEach((repField) => { // Loop through each field
        // Add data position information.
        const field = repField.id === 'value' ? addPos(nextValField) : addPos(repField)
        const val = getFieldData(input.data, field)
        if (field.id === 'parameter') nextValField = subInfo.fields[val - 1]
        if (field.id === 'value') {
          matchVals[field.id] = val
          subInfo = getPgnInfo({ pgn: fieldData[pgnIndex] }, matchVals, true)
        }
        // fieldProps()
        // if value save to matchVals and look for new pgnInfo subInfo
      })
    })
    console.log(subInfo, count)
  }
  // fill(start, end, value, array)
  return addDataFields(input, info, fieldData)
}

// Get raw data for all fields.
// No state. Assume input.singleFrame or input.dataReady is true.
// input.data should be an Uint8Array
// Info is the pgn info that has been sent through prepPgn(fixPgn(info))
function splitPgn(input, info, getPgnInfo) {
  // if (info.repeatingFields) return repeatingFields(input, info, getPgnInfo)
  const fields = getFieldInfo(input.data, info, getPgnInfo)
  const fieldData = getFieldsData(input, fields)
  return addDataFields(input, info, fieldData, fields)
}

// Add fieldData and info fields to input.
// info is result of getPgnInfo(input)
function addInfoFieldData(input, info, getPgnInfo) {
  if (!info.hasOptions) return splitPgn(input, info, getPgnInfo)
  // Has options. Need to find correct info option. Get fieldData at same time.
  let packetInfo = null
  function tryOption(infoOption) {
    // Do one check at a time. If no matchFields this is the default info.
    const matched = !infoOption.matchFields || infoOption.matchFields.every(
      ({ position, match }) => (
        getFieldData(input.data, infoOption.fields[position]) === match),
    )
    if (matched) packetInfo = splitPgn(input, infoOption, getPgnInfo)
    return matched
  }
  info.options.find(tryOption)
  return packetInfo
}

// Probably should be parse(getPgnInfo, input, state) where state is optional.
function parse(getPgnInfo, state, input) {
  const info = getPgnInfo(input)
  if (!info) {
    console.error('No PGN info available!', input)
    return input
  }
  // input.dataReady means the fast packets were assembled already.
  if (info.singleFrame || input.dataReady) {
    return addInfoFieldData(input, info, getPgnInfo)
  }
  // multi-frame
  const { data, ...seqState } = restoreFastPacket(input, state)
  if (data) {
    delete seqState.frames
    return addInfoFieldData({ ...input, data, seqState }, info, getPgnInfo)
  }
  return { ...input, info, seqState }
}

// Init state and pass along to parse function.
function parser(getPgnInfo) {
  const state = new Map()
  return (input) => parse(getPgnInfo, state, input)
}

module.exports = {
  getFieldInfo,
  getFieldData,
  getFieldsData,
  repeatingFields,
  splitPgn,
  parse,
  parser,
}
