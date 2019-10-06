const { conforms, isMap, rangeStep, set } = require('lodash/fp')
const { isGt } = require('understory')
const { subByte } = require('get-bits')
const { u8Concat } = require('./utilities')
// Limited to 223 bytes of data. 32 max frames.
// Default method of tx multi-frame n2k pgn msgs is Fast Packet protocol.

// sequenceId can be 0-8 (0x7 max)
// frameIndex can be 0-32 (0x1F max)

function parseFastPacket(data) {
  // The first byte contains a sequence counter and a frame counter.
  const frameIndex = subByte(data[0], 3, 5) // Last 5 bits of first byte.
  const info = {
    sequenceId: subByte(data[0], 0, 3), // First 3 bits of first byte.
    frameIndex,
  }
  if (frameIndex === 0x0) {
    // The first frame transmitted uses 2 bytes. 2nd byte is totalBytes.
    info.totalBytes = data[1]
    // Each frame can only contain 7 bytes since byte 1 is seqId and index.
    // totalBytes + 1 because first frame transmitted uses 2 bytes.
    info.totalFrames = Math.ceil((data[1] + 1) / 7)
    info.frameData = data.slice(2)
  } else {
    info.frameData = data.slice(1)
  }
  return info
}
const getSeqState = (idState, sequenceId) => idState.get(sequenceId) || ({
  frames: [], frameCount: 0, sequenceId
})

function restoreFastPacket({ canId, data }, stateMap) {
  // const state = isMap(stateMap) ? stateMap : new Map()
  const idState = stateMap.get(canId) || new Map()
  const info = parseFastPacket(data)
  const seqState = getSeqState(idState, info.sequenceId)
  if (info.frameIndex === 0x0) {
    seqState.totalBytes = info.totalBytes
    seqState.totalFrames = info.totalFrames
  }
  seqState.frames[info.frameIndex] = info.frameData
  seqState.frameCount = seqState.frameCount + 1
  if (seqState.totalFrames === seqState.frameCount) {
    seqState.data = u8Concat(seqState.frames, seqState.totalBytes)
    idState.delete(info.sequenceId)
    stateMap.set(canId, )
  } else {
    idState.set(info.sequenceId, seqState)
  }
  stateMap.set(canId, idState)
  return seqState
}

// seqId 7/0x7 max. frameIndex 31/0x1F max.
const createSeqState = (seqId, frameIndex) => (seqId << 5) | frameIndex

const expandBuff = function(buff) {
  const dataLength = buff.byteLength + 1
  const fillerBytes = 7 - (dataLength % 7)
  const tmp = new Uint8Array(dataLength + fillerBytes)
  tmp[0] = buff.byteLength
  tmp.set(new Uint8Array(buff), 1)
  // Fill in extra bytes to even things out.
  tmp.fill(255, dataLength)
  return tmp
}
const createFrame = (seqId, data) => (offset, frameIndex) => {
  const frame = new Uint8Array(8)
  frame[0] = createSeqState(seqId, frameIndex)
  frame.set(data.slice(offset, offset + 7), 1)
  return frame
}
function createFastPackets(buff, seqId = 0x5) {
  const data = expandBuff(buff)
  return rangeStep(7, 0, data.byteLength).map(createFrame(seqId, data))
}
module.exports = {
  createFastPackets,
  parseFastPacket,
  restoreFastPacket,
}
