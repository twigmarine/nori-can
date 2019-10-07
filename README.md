# Nori CAN

Process CAN network messages found on boats into usable javascript data objects. Helpful for displaying information and debugging network data issues. Inspiration from [canboatjs](https://github.com/canboat/canboatjs). Although this is mostly an entire rewrite, there was probably some copy pasta. This repo is only about processing messages. It does not contain any details on _how_ to process a message. You can look into using a source such as [canboat](https://github.com/canboat/canboat) for that. It also does nothing to help you get the messages from a usb/serial device or a udp/tcp server.

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

## Status

This is early alpha even if it does have a 1.x version. Breaking changes will get a full version bump. Expect many version bumps. Currently only processing string inputs. Don't have raw binary inputs working yet. Although, you could just create an object similar to what `parseString()` returns and then send it to `processPackets()` or `parse()`.

I needed something that could be used in the browser that didn't have any field definitions built in.

## Features

* Can read can strings from many input formats.
* Should work in a browser.
* Results contain a ton of information. It's not limited to just the data field info.

## Returned Parsed PGN Props

* canId: number - CAN Identifier. ISO 11783 (CAN 2.0 B Extended Frame Format)
* prio: number - Message priority.
* src: number - Source device address. Smaller numbers are from higher priority devices.
* dst: number - Who the message for. 255 is for any or all devices.
* pgn: number - Parameter Group Number. Defines the data on the network.
* id: string - The id of the matched fields definition.
* sequenceId: number - Fast-packet sequence Id.
* description: string - Description from fields defintion
* totalFrames: number - Fast-packet frames needed
* data: object - Parsed field information here. See Field Props below.

## Field Props

* bitLength: number - Number of bits of binary data used to make the value.
* type: string - The kind of data.
* name: string - Short title/description of the field.
* value: any - Processed value
* label: string - Result of looking up table based on value.
* units: string - The value is in
