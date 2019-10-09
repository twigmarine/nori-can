// Make a friendlier object to deal with.
function cleanup({
  canId, data, prio, src, dst, pgn, field,
  info: { id, description },
  seqState,
}) {
  // Should this be placed into a single object sequence: { id, length }?
  const sequenceId = seqState ? seqState.sequenceId : null
  const totalFrames = seqState ? seqState.totalFrames : null
  return {
    canId,
    prio,
    src,
    dst,
    pgn,
    data,
    id,
    description,
    sequenceId,
    totalFrames,
    field,
  }
}
module.exports = cleanup
