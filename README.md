# Nori CAN

Process CAN network messages found on boats into usable javascript data objects. Helpful for displaying information and debugging network data issues. Inspiration from [canboatjs](https://github.com/canboat/canboatjs). Although this is mostly an entire rewrite, there was probably some copy pasta. This repo is only about processing messages. It does not contain any details on _how_ to process a message. You can look into using a source such as [canboat](https://github.com/canboat/canboat) for that. It also does nothing to help you get the messages from a usb/serial device or a udp/tcp server.

## Status

This is alpha stage, even if it does have a 1.x version. Breaking changes will get a full version bump. Expect version bumps. Currently only processing string inputs. Binary inputs work by sending an object similar to what `parseString()` returns to `processPackets()` (partial multi-frames) or `parse()` or `processData(getPgnInfo)({ data, dataReady: true, pgn })` when data value is complete.

It's something that could be used in the browser that didn't have any field definitions built in.

## Install

`yarn add nori-can`

You will need a source of information on how to decode the various CAN messages based on PGN. Canboat is resource most use. It's required to bring in a set of definition files. Most people will use `yarn add @canboat/pgns`. Parameter groups are defined in the NMEA 2000 Standard, Appendix B that is available for purchase.

## Usage

### Parse a string

```javascript
const pgns = require('@canboat/pgns') // Third party definition file.
const { cleanup, canboatGetInfo, parser } = require('nori-can')

const getPgnInfo = canboatGetInfo(pgns)
const parse = parser(getPgnInfo)
const message = `19:27:10.670 R 11F80F03 20 1A 12 01 23 29 14 81
19:27:10.675 R 11F80F03 21 E1 23 D6 EC AA 04 1A
19:27:10.680 R 11F80F03 22 32 5A 76 00 00 C0 00
19:27:10.685 R 11F80F03 23 C0 FF 7F 00 C2 FF FF`

const result = parse(message)
console.log(cleanup(result[0]))
```

### Returned Parsed PGN Props

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

### Field Props

* bitLength: number - Number of bits of binary data used to make the value.
* type: string - The kind of data.
* name: string - Short title/description of the field.
* value: any - Processed value
* label: string - Result of looking up table based on value.
* units: string - The value is in

### Get PGN Info

```javascript
const pgns = require('@canboat/pgns') // Third party definition file.
const { canboatGetInfo } = require('nori-can')

const getPgnInfo = canboatGetInfo(pgns)

console.log(getPgnInfo(60928)) // note result is an array

// You will get something that looks like this:
const expectedRes = {
  pgn: 60928,
  id: 'isoAddressClaim',
  description: 'ISO Address Claim',
  complete: true,
  length: 8,
  repeatingFields: 0,
  fields: [
    {
      order: 1,
      id: 'uniqueNumber',
      name: 'Unique Number',
      description: 'ISO Identity Number',
      bitLength: 21,
      bitOffset: 0,
      bitStart: 0,
      type: 'Binary data',
      signed: false,
      resolution: 1,
      offset: 0,
      byteStart: 0,
      withinByte: false
    },
    {
      order: 2,
      id: 'manufacturerCode',
      name: 'Manufacturer Code',
      bitLength: 11,
      bitOffset: 21,
      bitStart: 5,
      type: 'Manufacturer code',
      signed: false,
      resolution: 1,
      offset: 0,
      byteStart: 2,
      withinByte: false
    },
    {
      order: 3,
      id: 'deviceInstanceLower',
      name: 'Device Instance Lower',
      description: 'ISO ECU Instance',
      bitLength: 3,
      bitOffset: 32,
      bitStart: 0,
      signed: false,
      resolution: 1,
      offset: 0,
      byteStart: 4,
      withinByte: true
    },
    {
      order: 4,
      id: 'deviceInstanceUpper',
      name: 'Device Instance Upper',
      description: 'ISO Function Instance',
      bitLength: 5,
      bitOffset: 35,
      bitStart: 3,
      signed: false,
      resolution: 1,
      offset: 0,
      byteStart: 4,
      withinByte: true
    },
    {
      order: 5,
      id: 'deviceFunction',
      name: 'Device Function',
      description: 'ISO Function',
      bitLength: 8,
      bitOffset: 40,
      bitStart: 0,
      signed: false,
      resolution: 1,
      offset: 0,
      bytes: 1,
      byteStart: 5,
      withinByte: true,
      byteEnd: 6
    },
    {
      order: 6,
      id: 'reserved',
      name: 'Reserved1',
      bitLength: 1,
      bitOffset: 48,
      bitStart: 0,
      type: 'Binary data',
      signed: false,
      resolution: 1,
      offset: 0,
      byteStart: 6,
      withinByte: true
    },
    {
      order: 7,
      id: 'deviceClass',
      name: 'Device Class',
      bitLength: 7,
      bitOffset: 49,
      bitStart: 1,
      type: 'Lookup table',
      signed: false,
      enumValues: [Map],
      resolution: 1,
      offset: 0,
      byteStart: 6,
      withinByte: true
    },
    {
      order: 8,
      id: 'systemInstance',
      name: 'System Instance',
      description: 'ISO Device Class Instance',
      bitLength: 4,
      bitOffset: 56,
      bitStart: 0,
      signed: false,
      resolution: 1,
      offset: 0,
      byteStart: 7,
      withinByte: true
    },
    {
      order: 9,
      id: 'industryGroup',
      name: 'Industry Group',
      bitLength: 3,
      bitOffset: 60,
      bitStart: 4,
      type: 'Lookup table',
      signed: false,
      enumValues: [Map],
      resolution: 1,
      offset: 0,
      byteStart: 7,
      withinByte: true
    },
    {
      order: 10,
      id: 'reserved',
      name: 'Reserved2',
      description: 'ISO Self Configurable',
      bitLength: 1,
      bitOffset: 63,
      bitStart: 7,
      type: 'Binary data',
      signed: false,
      resolution: 1,
      offset: 0,
      byteStart: 7,
      withinByte: true
    }
  ],
  singleFrame: true
}
```

## Features

* Can read CAN strings from many input formats.
* Worsk in modern browsers.
* Results contain a ton of information related to the field values, what they are, how they were calculated. It's not limited to just the data field info.

## CAN Identifier

The highest-order bits are the ones transmitted first and are the network access priority bits. Each of the bits in the identification field are used during the arbitration process when there is a network access conflict.

The standard boat CAN network adopts the CAN Extended Frame Format of SAE J1939 / ISO 11783. It uses a 29-bit extended message identifier instead of the 11-bit identifier found in the Standard Frame Format common to automobiles. The 29 bit ID includes Priority, Reserved, Data Page, PDU Format, PDU Specific (which can be a destination address, Group Extension, or proprietary), and Source Address.

| Bit Slice | Bits | Field          | Description                                                                                                          |
| --------- | ---- | -------------- | -------------------------------------------------------------------------------------------------------------------- |
| 26 - 28   | 3    | Priority       | These bits have the most impact during network access arbitration                                                    |
| 25        | 1    | Reserved Bit   | Reserved for future use                                                                                              |
| 24        | 1    | Data Page      | Reserved for future use?                                                                                             |
| 16 – 23   | 8    | Data ID Byte A | PDU FORMAT High-order byte of parameter group number of the data being transmitted                                   |
| 08 - 15   | 8    | Data ID Byte B | PDU SPECIFIC Low-order byte of parameter group number for global addresses OR destination for non-global data groups |
| 00 - 07   | 8    | Source Address | The final byte of the identification field always contains the address of the transmitting node.                     |

The distinction between CAN base frame format and CAN extended frame format is accomplished in CAN 2.0B by using the IDE bit inside the Control Field. A low (dominant) IDE bit indicates an 11 bit message identifier; a high (recessive) IDE bit indicates a 29 bit identifier. During bus arbitration the standard 11 bit message ID frame will always have higher priority than the extended 29 bit message ID frame with identical 11 bit base identifier and thus gain bus access.

The 29 bit message identifier consists of the regular 11 bit base identifier and an 18 bit identifier extension. Between the SOF (Start of Frame) bit and the end of the 11 bit (base) message identifier, both frame formats, Standard and Extended, are identical. Following the 11 bit base identifier, the Extended Format uses an (always recessive) SRR (Substitute Remote Request) bit, which, as its name implies, replaces the regular RTR (Remote Transmission Request). The following IDE (Identifier Extension) bit is also kept at a recessive level.

### ISO 11783 Protocol Data Unit (PDU)

Reserved bit, Data Page bit, PDU Format Field (8 bits), and Group Extension Field (8 bits). These 18 bits are used to establish the 24 bit PGN.

Messages transmitted on the network are organized into parameter groups that are identified by a parameter group number (PGN) that appears in the CAN identifier field as either an 8-bit or 16-bit value depending on whether the parameter group is designed as an addressed or a broadcast message. The term Parameter Group Number (PGN) is used to refer to the value of the Reserve bit, DP, PF, and PS fields combined into a single 18 bit value.

Most messages are designed as broadcast messages. Since only 1-byte is available for addressed messages this type is usually used for network management (requests, generic commands, acknowledgement, error reports, and manufacturer proprietary addressed messages).

* If the PF is between 0 and 239, the message is addressable (PDU1) and the PS field contains the destination address.
* If the PF is between 240 and 255, the message can only be broadcast (PDU2) and the PS field contains a Group Extension.

The ID 0xCF004EE can be divided into the following chunks

| 0x0C                              | 0xF0                  | 0x04                    | 0xEE                |
| --------------------------------- | --------------------- | ----------------------- | ------------------- |
| 000 011 0 0                       | 11110000              | 00000100                | 11101110            |
| Priority, Reserved Bit, Data Page | Parameter Format (PF) | Parameter Specific (PS) | Source Address (SA) |

Binary chunks

| 000                           | 011  | 0   | 0   | 11110000 | 00000100 | 11101110 |
| ----------------------------- | ---- | --- | --- | -------- | -------- | -------- |
| Unused because ID is 29 bits. | Prio | R   | DP  | PF       | PS       | SA       |

* PGN = the R, DP, PF and PS fields – in this case 0x0F004.
* PF = 0xF0 = 240, i.e. this is a PDU2 (broadcast) message
* PS = 0x04, i.e. the Group Extension = 4

### Source Address

All compliant devices must be self-configurable and capable of claiming addresses according to the ISO 11783-5 protocol. Physical network connections are not directly identified by a name or specific address and a single physical connection may be the location of more than one functional address.

* Devices Use source address to determine device Network priority
* Devices source address is determined by the devices Unique ID and NAME.
* Source addresses can change. Do not use them as a unique permanent device identifier.

### Priority
