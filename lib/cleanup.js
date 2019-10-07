// Make a friendlier object to deal with.
function cleanup({
  canId, prio, src, dst, pgn, field,
  info: { id, description },
  seqState: { sequenceId, totalFrames },
}) {
  return {
    canId, prio, src, dst, pgn, id, sequenceId, description, totalFrames, data: field,
  }
}
module.exports = cleanup
