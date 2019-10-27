// Make a friendlier object to deal with.
function cleanup({
  canId, data, prio, src, dst, pgn, pgnHex, field,
  info: {
    id, category, description, name,
  },
  msgId,
  seqState,
  time,
}) {
  // Should this be placed into a single object sequence: { id, length }?
  const sequenceId = seqState ? seqState.sequenceId : null
  const totalFrames = seqState ? seqState.totalFrames : null
  return {
    canId,
    msgId,
    // canIdHex: hexByte(canId),
    time,
    prio,
    src,
    // srcHex: hexByte(src),
    dst,
    pgn,
    pgnHex,
    data,
    id,
    name,
    category,
    description,
    sequenceId,
    totalFrames,
    field,
  }
}
module.exports = cleanup
