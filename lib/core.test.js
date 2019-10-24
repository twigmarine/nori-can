const _ = require('lodash/fp')
const pgns = require('@canboat/pgns')
const { canboatGetInfo } = require('./pgns')
const { parser } = require('./core')
const { hexSpStrBuff } = require('./utilities')

const getPgnInfo = canboatGetInfo(pgns)

/* globals describe test expect */

const input1 = `19:23:48.439 R 11F80F13 40 1B 12 78 F5 EF 15 D5
19:23:48.448 R 11F80F13 41 52 70 D2 AD 71 31 17
19:23:48.458 R 11F80F13 42 C3 38 8E E7 00 06 00
19:23:48.468 R 11F80F13 43 06 FF FF 00 74 01 FF
19:23:48.759 R 11F80F13 60 1B 12 D2 B6 E8 15 DD
19:23:48.769 R 11F80F13 61 AA 69 D2 3C 2D 39 17
19:23:48.779 R 11F80F13 62 C3 CD E4 05 00 06 00
19:23:48.793 R 11F80F13 63 26 FF FF 00 74 01 FF
19:23:49.669 R 11F80F13 80 1B 12 C2 A5 F0 15 85
19:23:49.679 R 11F80F13 81 25 6A D2 77 63 39 17
19:23:49.689 R 11F80F13 82 C7 FF FF 00 00 1A 52
19:23:49.699 R 11F80F13 83 01 FF FF 00 70 01 FF
19:23:49.910 R 11F80F13 A0 1B 12 AE 10 E5 15 CB
19:23:49.920 R 11F80F13 A1 B4 72 D2 D0 81 32 17
19:23:49.930 R 11F80F13 A2 C4 8D EB 39 01 06 00
19:23:49.940 R 11F80F13 A3 0E 07 F2 00 74 01 FF
19:23:50.391 R 11F80F13 C0 1B 12 24 C8 E4 15 D9
19:23:50.398 R 11F80F13 C1 DF 70 D2 18 83 34 17
19:23:50.795 R 11F80F13 E0 1B 12 D2 B6 E8 15 ED
19:23:50.795 R 11F80F13 E1 AA 69 D2 3C 2D 39 17
19:23:50.800 R 11F80F13 E2 CB CD E4 05 00 06 00
19:23:50.810 R 11F80F13 E3 26 FF FF 00 74 01 FF
19:23:50.922 R 11F80F13 00 1B 12 86 4C 0D 16 92
19:23:50.930 R 11F80F13 01 14 6C D2 3E 3C 3C 17
19:23:50.940 R 11F80F13 02 CC 72 98 00 00 06 00
19:23:50.950 R 11F80F13 03 0E FF FF 00 34 01 FF
19:23:51.877 R 11F80F13 20 1B 12 08 E7 E6 15 49
19:23:51.885 R 11F80F13 21 A6 71 D2 5D 27 3A 17
19:23:51.895 R 11F80F13 22 CC FC CB 91 01 06 00
19:23:51.905 R 11F80F13 23 06 FF FF 00 74 01 FF`

const getOwnAis = _.find(({ fieldData }) => fieldData[11] === 4)

describe('parser', () => {
  test('process many line input string', () => {
    const parse = parser(getPgnInfo)
    const res = parse(input1)
    expect(res.length).toBe(8)
    const ownAis = getOwnAis(res)
    expect(ownAis.fieldData[3]).toBe(-76.4826915)
    expect(ownAis.fieldData[4]).toBe(38.96231)
    // Not certain this is correct.
    // console.log(res[0].field.communicationState)
    expect(res[0]).toEqual({
      input: '19:23:48.468 R 11F80F13 43 06 FF FF 00 74 01 FF',
      format: 'YDRAW',
      time: '19:23:48.468',
      direction: 'R',
      canId: 301469459,
      data: hexSpStrBuff('12 78 F5 EF 15 D5 52 70 D2 AD 71 31 17 C3 38 8E E7 00 06 00 06 FF FF 00 74 01 FF', ' '),
      fieldData: [
        18, // Message ID
        0, // Initial
        368047480, // userId
        -76.4390699, // long
        38.9116333, // lat
        1, // "Position Accuracy": "High",
        1, // "RAIM": "in use",
        48, // "Time Stamp": "48",
        3.6408, // COG
        2.31, // SOG
        393222, // Communication State
        0, // AIS Transceiver Information - Channel A VDL reception - 4 would be Own Info
        null, // True Heading
        0, // Reserved for Regional Applications
        0, // Reserved for Regional Applications
        1, // Class B unit flag - CS
        0, // Class B Display Flag - None
        1, // DSC - Yes
        1, // Band
        1, // Can handle Msg 22
        0, // AIS Mode - autonomous
        1, // Communication State Selector Flag. ITDMA communication state follows.
        32640, // Unkown?!
      ],
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
          value: 368047480,
        },
        longitude: {
          bitLength: 32,
          type: 'Latitude',
          name: 'Longitude',
          units: 'deg',
          resolution: 1e-7,
          value: -76.4390699,
        },
        latitude: {
          bitLength: 32,
          type: 'Longitude',
          name: 'Latitude',
          units: 'deg',
          resolution: 1e-7,
          value: 38.9116333,
        },
        positionAccuracy: {
          bitLength: 1,
          type: 'Lookup table',
          name: 'Position Accuracy',
          value: 1,
          label: 'High',
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
          value: 48,
          label: undefined,
        },
        cog: {
          bitLength: 16,
          name: 'COG',
          units: 'rad',
          resolution: 0.0001,
          value: 3.6408,
        },
        sog: {
          bitLength: 16,
          name: 'SOG',
          units: 'm/s',
          resolution: 0.01,
          value: 2.31,
        },
        communicationState: {
          bitLength: 19,
          type: 'Binary data',
          description: 'Information used by the TDMA slot '
            + 'allocation algorithm and synchronization '
            + 'information',
          name: 'Communication State',
          value: 393222,
        },
        aisTransceiverInformation: {
          bitLength: 5,
          type: 'Lookup table',
          name: 'AIS Transceiver information',
          value: 0,
          label: 'Channel A VDL reception',
        },
        heading: {
          bitLength: 16,
          description: 'True heading',
          name: 'Heading',
          units: 'rad',
          resolution: 0.0001,
          value: null,
        },
        regionalApplication: { bitLength: 2, name: 'Regional Application1', value: 0 },
        unitType: {
          bitLength: 1,
          type: 'Lookup table',
          name: 'Unit type',
          value: 1,
          label: 'CS',
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
          value: 1,
          label: 'Yes',
        },
        band: {
          bitLength: 1,
          type: 'Lookup table',
          name: 'Band',
          value: 1,
          label: 'entire marine band',
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
          value: 0,
          label: 'Autonomous',
        },
        aisCommunicationState: {
          bitLength: 1,
          type: 'Lookup table',
          name: 'AIS communication state',
          value: 1,
          label: 'ITDMA',
        },
      },
      pgn: 129039,
      src: 19,
      dst: 255,
      prio: 4,
      info: getPgnInfo({ pgn: 129039 }),
      seqState: {
        frameCount: 4,
        totalBytes: 27,
        sequenceId: 2,
        totalFrames: 4,
      },
    })
  })
})
// {

//   "Band": "entire marine band",
//   "Can handle Msg 22": "Yes",
//   "AIS mode": "Autonomous",
//   "AIS communication state": "ITDMA"
// }
