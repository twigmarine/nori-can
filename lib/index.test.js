const pgns = require('@canboat/pgns')
const pgns2 = require('nori-pgns')

const {
  hexSpStrBuff, cleanup, canboatGetInfo, createGetInfo,
  dataParser, parser, processStringInput,
} = require('../')

/* globals describe test expect */

const getPgnInfo = canboatGetInfo(pgns)
const getPgnInfo2 = createGetInfo(pgns2)

describe('parser', () => {
  // canId, prio, src, dst, ...info, field
  test('parse a chunk of string lines', () => {
    const parse = parser(getPgnInfo)
    const message = `19:27:10.670 R 11F80F03 20 1A 12 01 23 29 14 81
    19:27:10.675 R 11F80F03 21 E1 23 D6 EC AA 04 1A
    19:27:10.680 R 11F80F03 22 32 5A 76 00 00 C0 00
    19:27:10.685 R 11F80F03 23 C0 FF 7F 00 C2 FF FF`
    const result = parse(message)
    const val = cleanup(result[0])
    expect(val.field.communicationState.value).toBe(192)
    expect(val).toEqual({
      canId: 301469443,
      prio: 4,
      src: 3,
      dst: 255,
      time: '19:27:10.685',
      pgn: 129039,
      id: 'aisClassBPositionReport',
      sequenceId: 1,
      description: 'AIS Class B Position Report',
      totalFrames: 4,
      data: hexSpStrBuff(
        '12 01 23 29 14 81 e1 23 d6 ec aa 04 1a 32 5a 76 00 00 c0 00 c0 ff 7f 00 c2 ff',
        ' ',
      ),
      field: {
        messageId: { bitLength: 6, name: 'Message ID', value: 18 },
        repeatIndicator: {
          bitLength: 2,
          type: 'Lookup table',
          name: 'Repeat Indicator',
          value: 0,
          label: 'Initial',
        },
        userId: {
          bitLength: 32,
          type: 'Integer',
          name: 'User ID',
          units: 'MMSI',
          value: 338240257,
        },
        longitude: {
          bitLength: 32,
          type: 'Latitude',
          name: 'Longitude',
          units: 'deg',
          resolution: 1e-7,
          value: -70.2291583,
        },
        latitude: {
          bitLength: 32,
          type: 'Longitude',
          name: 'Latitude',
          units: 'deg',
          resolution: 1e-7,
          value: 43.6513516,
        },
        positionAccuracy: {
          bitLength: 1,
          type: 'Lookup table',
          name: 'Position Accuracy',
          value: 0,
          label: 'Low',
        },
        raim: {
          bitLength: 1,
          type: 'Lookup table',
          name: 'RAIM',
          value: 1,
          label: 'in use',
        },
        timeStamp: {
          bitLength: 6,
          type: 'Lookup table',
          description: '0-59 = UTC second when the report was generated',
          name: 'Time Stamp',
          value: 12,
          label: undefined,
        },
        cog: {
          bitLength: 16,
          name: 'COG',
          units: 'rad',
          resolution: 0.0001,
          value: 3.0298,
        },
        sog: {
          bitLength: 16,
          name: 'SOG',
          units: 'm/s',
          resolution: 0.01,
          value: 0,
        },
        communicationState: {
          bitLength: 19,
          type: 'Binary data',
          description: 'Information used by the TDMA slot '
              + 'allocation algorithm and synchronization '
              + 'information',
          name: 'Communication State',
          value: 192,
        },
        aisTransceiverInformation: {
          bitLength: 5,
          type: 'Lookup table',
          name: 'AIS Transceiver information',
          value: 24,
          label: undefined,
        },
        heading: {
          bitLength: 16,
          description: 'True heading',
          name: 'Heading',
          units: 'rad',
          resolution: 0.0001,
          value: 3.2767,
        },
        regionalApplication: {
          bitLength: 2, name: 'Regional Application1', value: 2,
        },
        unitType: {
          bitLength: 1,
          type: 'Lookup table',
          name: 'Unit type',
          value: 0,
          label: 'SOTDMA',
        },
        integratedDisplay: {
          bitLength: 1,
          type: 'Lookup table',
          description: 'Whether the unit can show messages 12 and 14',
          name: 'Integrated Display',
          value: 0,
          label: 'No',
        },
        dsc: {
          bitLength: 1,
          type: 'Lookup table',
          name: 'DSC',
          value: 0,
          label: 'No',
        },
        band: {
          bitLength: 1,
          type: 'Lookup table',
          name: 'Band',
          value: 0,
          label: 'top 525 kHz of marine band',
        },
        canHandleMsg22: {
          bitLength: 1,
          type: 'Lookup table',
          description: 'Whether device supports message 22',
          name: 'Can handle Msg 22',
          value: 1,
          label: 'Yes',
        },
        aisMode: {
          bitLength: 1,
          type: 'Lookup table',
          name: 'AIS mode',
          value: 1,
          label: 'Assigned',
        },
        aisCommunicationState: {
          bitLength: 1,
          type: 'Lookup table',
          name: 'AIS communication state',
          value: 1,
          label: 'ITDMA',
        },
        unkownData: {
          bitLength: 7,
          name: 'Unkown Binary Data',
          type: 'Binary data',
          value: 127,
        },
      },
    })
  })
  test('fast-packet', () => {
    const parse = parser(getPgnInfo2)
    const message = `00:24:25.201 R 19F01649 60 39 13 01 55 6E 64 65
      00:24:25.201 R 19F01649 61 72 20 43 68 61 72 74
      00:24:25.202 R 19F01649 62 20 54 61 62 6C 65 02
      00:24:25.202 R 19F01649 63 01 24 01 59 61 63 68
      00:24:25.203 R 19F01649 64 74 20 44 65 76 69 63
      00:24:25.203 R 19F01649 65 65 73 20 4C 74 64 2E
      00:24:25.204 R 19F01649 66 2C 20 77 77 77 2E 79
      00:24:25.205 R 19F01649 67 61 63 68 74 64 2E 63
      00:24:25.205 R 19F01649 68 6F 6D`
    const result = parse(message)
    expect(result[0].field.manufacturerInformation.value)
      .toBe('Yacht Devices Ltd., www.yachtd.com')
  })
})
describe('dataParser', () => {
  const parse = dataParser(getPgnInfo)
  test('field prop is null when a partial multi-packet', () => {
    const frame = '19:27:10.675 R 11F80F03 21 E1 23 D6 EC AA 04 1A'
    const framesInfo = processStringInput(frame) // The result is an array
    const res = parse(framesInfo) // Must get an array.
    expect(res).toMatchObject([{
      time: '19:27:10.675',
      field: null,
    }])
  })
  test('ISO Address Claim', () => {
    const framesInfo = {
      pgn: 60928,
      data: hexSpStrBuff('00 00 c0 2c 00 aa 46 c0', ' '),
    }
    const res = parse([framesInfo])
    expect(cleanup(res[0]).field).toEqual({
      uniqueNumber: {
        bitLength: 21,
        type: 'Binary data',
        description: 'ISO Identity Number',
        name: 'Unique Number',
        value: 0,
      },
      manufacturerCode: {
        bitLength: 11,
        type: 'Manufacturer code',
        name: 'Manufacturer Code',
        value: 358,
        label: 'Victron Energy',
      },
      deviceInstanceLower: {
        bitLength: 3,
        description: 'ISO ECU Instance',
        name: 'Device Instance Lower',
        value: 0,
      },
      deviceInstanceUpper: {
        bitLength: 5,
        description: 'ISO Function Instance',
        name: 'Device Instance Upper',
        value: 0,
      },
      deviceFunction: {
        bitLength: 8,
        description: 'ISO Function',
        name: 'Device Function',
        value: 170,
        label: 'Battery',
        labelDetails: 'Reports battery status',
      },
      reserved: {
        bitLength: 1,
        type: 'Binary data',
        description: 'ISO Self Configurable',
        name: 'Reserved2',
        value: true,
      },
      deviceClass: {
        bitLength: 7,
        type: 'Lookup table',
        name: 'Device Class',
        value: 35,
        label: 'Electrical Generation',
        labelDetails: 'Equipment that outputs electrical "power", not used primarily to propel the vessel',
      },
      systemInstance: {
        bitLength: 4,
        description: 'ISO Device Class Instance',
        name: 'System Instance',
        value: 0,
      },
      industryGroup: {
        bitLength: 3,
        type: 'Lookup table',
        name: 'Industry Group',
        value: 4,
        label: 'Marine',
      },
    })
  })
  test('single packet works', () => {
    const frame = '20:43:04.296 R 09F1120D 00 9D 16 FF 7F FF 7F FD'
    const framesInfo = processStringInput(frame) // The result is an array
    const res = parse(framesInfo) // Must get an array.
    // console.log(res[0].field)
    expect(cleanup(res[0])).toEqual({
      canId: 166793741,
      data: hexSpStrBuff('00 9D 16 FF 7F FF 7F FD', ' '),
      time: '20:43:04.296',
      field: {
        deviation: {
          bitLength: 16,
          name: 'Deviation',
          resolution: 0.0001,
          units: 'rad',
          value: null,
        },
        heading: {
          bitLength: 16,
          name: 'Heading',
          resolution: 0.0001,
          units: 'rad',
          value: 0.5789,
        },
        reference: {
          bitLength: 2,
          label: 'Magnetic',
          name: 'Reference',
          type: 'Lookup table',
          value: 1,
        },
        reserved: {
          bitLength: 6,
          description: 'Reserved',
          name: 'Reserved1',
          type: 'Binary data',
          value: 0x3f,
        },
        sid: {
          bitLength: 8,
          name: 'SID',
          value: 0,
        },
        variation: {
          bitLength: 16,
          name: 'Variation',
          resolution: 0.0001,
          units: 'rad',
          value: null,
        },
      },
      description: 'Vessel Heading',
      dst: 255,
      id: 'vesselHeading',
      pgn: 127250,
      prio: 2,
      sequenceId: null,
      src: 13,
      totalFrames: null,
    })
  })
})
