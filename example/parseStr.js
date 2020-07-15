// STEP 1
// Import or create your PGN definitions.
const noriPgns = require('nori-pgns') // private repo
const {
  byteString, getParser, hexToView, toNumber,
} = require('../')

// STEP 2
// Create parse function with imported PGN infos.
const parse = getParser(noriPgns)

// STEP 3
// Get some data

const str = `2019-10-19T03:38:13.695Z,2,127251,4,255,8,ff,65,c7,01,00,ff,ff,ff
2019-10-19T03:38:13.727Z,2,127251,4,255,8,ff,38,4b,02,00,ff,ff,ff
2019-10-19T03:38:13.854Z,2,127251,4,255,8,ff,bf,bf,00,00,ff,ff,ff
2019-10-19T03:38:13.919Z,2,127251,4,255,8,ff,3d,4c,ff,ff,ff,ff,ff
2019-10-19T03:38:13.991Z,2,127251,4,255,8,ff,11,d0,ff,ff,ff,ff,ff
2019-10-19T03:38:14.022Z,2,127251,4,255,8,ff,6a,c8,fe,ff,ff,ff,ff
2019-10-19T03:38:14.171Z,2,127251,4,255,8,ff,eb,3b,00,00,ff,ff,ff`

// STEP 4
// Send it an object with pgn property to lookup.
const res = parse(str)
  .map(({ data, field }) => ({
    data: byteString(data.slice(1, 5)),
    rate: field.rate.value,
  }))

// console.log(res)

console.log(toNumber(hexToView('11,D0,FF,FF'), true))


const str2 = `19:01:26.091 T 0DED0942 02 74 20 54 61 62 6C 65
19:01:26.123 R 0DED4209 01 F0 FF FF FF FF FF FF
19:23:14.656 R 0DEDFF1B 02 01 03 04 04 F3 64 FF
19:23:14.662 R 19ED1B82 A1 00 F0 FF FF FF FF FF`

// console.log(parse(str2))

// -12271 * 0.00000003125 =
// -0.00038346875
// -0.00038346875 / -0.021971140950157 deg/sec * 60 -1.32 deg/min
// 2147483647 maxVal 67 radians
// 0.00029
// console.log(numMap)

const str3 = `00:23:15.816 R 1DFF0102 20 1C 27 99 00 22 04 00
00:23:15.817 R 1DFF0102 21 04 03 00 04 03 00 04
00:23:15.817 R 1DFF0102 22 03 00 04 04 28 04 03
00:23:15.818 R 1DFF0102 23 00 04 00 00 04 00 00
00:23:15.819 R 1DFF0102 24 04 FF FF FF FF FF FF`

// console.log(parse(str3)[0])

const str4 = `21:54:44.147 R 0DEDD100 61 01 01 00 01 03 FF FF
21:54:44.148 R 0DED00D1 C1 00 FF FF FF FF FF FF
21:54:44.154 R 0DEDD100 68 66 00 20 FF FF FF FF`
// console.log(parse(str4)[0])

const str5 = `21:55:27.126 R 0DEDD200 81 01 01 10 01 01 FF FF
21:55:27.128 R 0DED00D2 E1 00 FF FF FF FF FF FF
21:55:27.134 R 0DEDD200 88 66 00 20 FF FF FF FF`

// console.log(parse(str5)[0])

const str6 = `22:13:41.236 R 0DEDE100 A1 01 01 00 01 02 FF FF
22:13:41.238 R 0DED00E1 01 01 01 00 01 02 FF FF
22:13:41.246 R 0DEDE100 A8 66 00 20 FF FF FF FF`

const str7 = `04:12:22.228 R 15FD0A05 FF 00 01 F3 2A 01 00 FF
04:12:22.229 R 15FD0A05 FF 01 01 91 17 0A 00 FF`

console.log(parse(str7))
