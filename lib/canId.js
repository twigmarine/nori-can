const { flow } = require('lodash/fp')
const { setField } = require('prairie')

/* eslint no-bitwise: 0 */
exports.pgnAddressable = (pgn) => ((pgn >> 8) & 0xFF) < 240

/**
 * Decode Protocol Data Unit CAN Identifier (canId). ISO 11783 (CAN 2.0 B Extended Frame Format)
 * @param  {Number} id canId in a 32 bit number/binary format.
 * @return {Object} {canId, prio, src, dst, pgn}
 */
exports.parseCanId = (id) => {
  if (!id) return id // Do we want this? Used for auto parse of canId field that might be null.
  const res = {
    canId: id, // Include original canId in return object.
    prio: ((id >> 26) & 0x7), // Priority
    src: id & 0xFF, // Source Address (SA)
  }
  const DP = (id >> 24) & 1 // Data Page
  const PF = (id >> 16) & 0xFF // PDU Format
  const PS = (id >> 8) & 0xFF // PDU Specific

  if (PF < 240) {
    /* PDU1 format, the PS contains the destination address */
    res.dst = PS
    res.pgn = (DP << 16) + (PF << 8)
  } else {
    /* PDU2 format, the destination is implied global and the PGN is extended */
    res.dst = 0xFF
    res.pgn = (DP << 16) + (PF << 8) + PS
  }
  return res
}
// canId should be a hex encoded string without spaces or commas.
exports.parseCanIdStr = (canId) => exports.parseCanId(parseInt(canId, 16))

// Encode CAN Identifier (canId)
exports.encodeCanId = ({
  dst, pgn, prio, src = 0,
}) => {
  // Priority must be between 0 and 7.
  const priority = Math.max(Math.min(prio || 6, 7), 0)
  // src bits are the lowest ones of the CAN ID. prio bits are highest.
  const canId = (priority << 26) | (pgn << 8) | src
  // PDU 1 Also 8 lowest bits of the PGN are 0.
  return exports.pgnAddressable(pgn) ? canId | (dst << 8) : canId
}

exports.addCanId = setField('canId', exports.encodeCanId)

exports.buildCanId = (prio, pgn, dst, src) => exports.addCanId({
  prio: Number(prio),
  pgn: Number(pgn),
  dst: Number(dst),
  src: Number(src),
})

exports.canIdString = (canId) => canId.toString(16).padStart(8, '0').toUpperCase()
exports.encodeCanIdString = flow(
  exports.encodeCanId,
  exports.canIdString,
)
// Utility function that parses and re-encodes. Compare result to original.
exports.parseEncode = (x) => exports.encodeCanId(exports.parseCanId(x))
