const pgns = require('nori-pgns')
// const samples = require('nori-pgns/samples')

const {
  createGetInfo, encodeCanId, hexToBuff, processData,
} = require('./')

const parser = processData(createGetInfo(pgns))
const parse = (dataStr, pgn) => parser({
  canId: encodeCanId({ pgn }),
  data: hexToBuff(dataStr),
  dataReady: true,
  pgn,
})

console.log(parse('FF 00 00 FF FF FF FF FF', 130316))
// seqId: FF,
// instance: 00,
// source: 00,
// temp: FF FF FF,
// set: FF FF,
