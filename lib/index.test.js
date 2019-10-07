const pgns = require('@canboat/pgns')
const { cleanup, createGetInfo, parser } = require('../')

/* globals describe test expect */


describe('parser', () => {
  const getPgnInfo = createGetInfo(pgns)
  const parse = parser(getPgnInfo)
  const message = `19:27:10.670 R 11F80F03 20 1A 12 01 23 29 14 81
  19:27:10.675 R 11F80F03 21 E1 23 D6 EC AA 04 1A
  19:27:10.680 R 11F80F03 22 32 5A 76 00 00 C0 00
  19:27:10.685 R 11F80F03 23 C0 FF 7F 00 C2 FF FF`

  const result = parse(message)
  // canId, prio, src, dst, ...info, field
  test('parse a chunk of string lines', () => {
    expect(cleanup(result[0])).toEqual({
      canId: 301469443,
      prio: 4,
      src: 3,
      dst: 255,
      pgn: 129039,
      id: 'aisClassBPositionReport',
      sequenceId: 1,
      description: 'AIS Class B Position Report',
      totalFrames: 4,
      data: {
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
          value: '06,00,06',
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
      },
    })
  })
})
