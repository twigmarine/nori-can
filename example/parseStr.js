// STEP 1
// Import or create your PGN definitions.
const noriPgns = require('nori-pgns') // private repo
const {
  byteString, getParser, hexToView, toNumber, numMap,
} = require('../')

// STEP 2
// Create parse function with imported PGN infos.
const parse = getParser(noriPgns)

// STEP 3
// Get some data

const str = `2019-10-19T03:38:13.695Z,2,127251,4,255,8,ff,65,c7,01,00,ff,ff,ff
2019-10-19T03:38:13.727Z,2,127251,4,255,8,ff,38,4b,02,00,ff,ff,ff
2019-10-19T03:38:13.795Z,2,127251,4,255,8,ff,65,c7,01,00,ff,ff,ff
2019-10-19T03:38:13.854Z,2,127251,4,255,8,ff,bf,bf,00,00,ff,ff,ff
2019-10-19T03:38:13.902Z,2,127251,4,255,8,ff,11,d0,ff,ff,ff,ff,ff
2019-10-19T03:38:13.919Z,2,127251,4,255,8,ff,3d,4c,ff,ff,ff,ff,ff
2019-10-19T03:38:13.991Z,2,127251,4,255,8,ff,11,d0,ff,ff,ff,ff,ff
2019-10-19T03:38:14.022Z,2,127251,4,255,8,ff,6a,c8,fe,ff,ff,ff,ff
2019-10-19T03:38:14.085Z,2,127251,4,255,8,ff,eb,3b,00,00,ff,ff,ff
2019-10-19T03:38:14.171Z,2,127251,4,255,8,ff,eb,3b,00,00,ff,ff,ff`

// STEP 4
// Send it an object with pgn property to lookup.
const res = parse(str)
  .map(({ data, field }) => ({ data: byteString(data.slice(1, 5)), rate: field.rate.value }))

console.log(res)

console.log(toNumber(hexToView('11,D0,FF,FF'), true))
// -12271 * 0.00000003125 =
// -0.00038346875
// -0.00038346875 / -0.021971140950157 deg/sec * 60 -1.32 deg/min
// 2147483647 maxVal 67 radians
// 0.00029
// console.log(numMap)
