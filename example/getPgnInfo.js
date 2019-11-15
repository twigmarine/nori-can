// STEP 1
// Import or create your PGN definitions.
const noriPgns = require('nori-pgns') // private repo
const canboatPgns = require('@canboat/pgns')

// STEP 2
// Import utility function that creates a lookup Map().
const {
  canboatGetInfo, createGetInfo,
} = require('../')

// STEP 3
// Create lookup function.
const lookup1 = createGetInfo(noriPgns)
const lookup2 = canboatGetInfo(canboatPgns)

// STEP 4
// Send it an object with pgn property to lookup.
const info1 = lookup1({ pgn: 0x1EF00 })
const info2 = lookup2({ pgn: 0x1EF00 })
console.log(info1)
