# Nori CAN

Process CAN network messages found on boats into usable javascript data objects. Helpful for displaying information and debugging network data issues. Inspiration from [canboatjs](). Although this is mostly an entire rewrite, there was probably some copy pasta.

## Install

`yarn add nori-can`

You will need a source of information on how to decode the various CAN messages based on PGN. Canboat is resource most use. It's also possible to bring in your own public or private definition files.

`yarn add @canboat/pgns`

## Usage

```javascript
const pgns = require('@canboat/pgns')
const { cleanup, createGetInfo, parser } = require('nori-can')

const getPgnInfo = createGetInfo(pgns)
const parse = parser(getPgnInfo)
const message = `19:27:10.670 R 11F80F03 20 1A 12 01 23 29 14 81
19:27:10.675 R 11F80F03 21 E1 23 D6 EC AA 04 1A
19:27:10.680 R 11F80F03 22 32 5A 76 00 00 C0 00
19:27:10.685 R 11F80F03 23 C0 FF 7F 00 C2 FF FF`

const result = parse(message)
console.log(cleanup(result[0]))
```
