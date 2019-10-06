const { field2Arr, fixFields, getPgn, getPgn0, pgns } = require('./pgns')

// console.log(pgns)
describe('getPgn', () => {
  test('Return info array about a pgn number', () => {
    expect(getPgn('60928')[0].Description).toBe('ISO Address Claim')
    expect(getPgn(60928)[0].Description).toBe('ISO Address Claim')
  })
})
describe('getPgn0', () => {
  test('Return first info object about a pgn number', () => {
    expect(getPgn0('60928').Description).toBe('ISO Address Claim')
    expect(getPgn0(60928).Description).toBe('ISO Address Claim')
  })
})
describe('field2Arr', () => {
  test('Turn object with Field prop to an array', () => {
    const field = {foo: 'bar'}
    expect(field2Arr({ Field: field })).toEqual([field ])
    expect([{}]).toEqual([{} ])
  })
})

describe('fixFields', () => {
  test('Convert Field object to array', () => {
    expect(fixFields({ Field: { Bytes: 2, foo: 'bar' } })).toEqual([{
      BitLength: 16,
      BitOffset: 0,
      BitStart: 0,
      ByteStart: 0,
      ByteEnd: 2,
      Bytes: 2,
      Offset: 0,
      Resolution: 1,
      WithinByte: false,
      Id:" unknown",
      Name: "Unknown1",
      Signed: false,
      foo: 'bar',
    }])
  })
  const fields = [{ Name: 'cat'}, { Name: 'cat'}, { BitLength: 1, Name: 'Reserved' }, { BitLength: 7, Name: 'Reserved'}]
  test('Build out Fields array', () => {
    expect(fixFields(fields)).toEqual([
      {
        BitLength: 8,
        BitOffset: 0,
        BitStart: 0,
        ByteStart: 0,
        ByteEnd: 1,
        Bytes: 1,
        Offset: 0,
        Resolution: 1,
        WithinByte: true,
        Id:" unknown",
        Name: "cat",
        Signed: false,
      },
      {
        BitLength: 8,
        BitOffset: 8,
        BitStart: 0,
        ByteStart: 1,
        ByteEnd: 2,
        Bytes: 1,
        Offset: 0,
        Resolution: 1,
        WithinByte: true,
        Id:" unknown",
        Name: "cat1",
        Signed: false,
      },
      {
        BitLength: 1,
        BitOffset: 16,
        BitStart: 0,
        ByteStart: 2,
        Offset: 0,
        Resolution: 1,
        WithinByte: true,
        Id:" unknown",
        Name: "Reserved1",
        Signed: false,
      },
      {
        BitLength: 7,
        BitOffset: 17,
        BitStart: 1,
        ByteStart: 2,
        Offset: 0,
        Resolution: 1,
        WithinByte: true,
        Id:" unknown",
        Name: "Reserved2",
        Signed: false,
      },
    ])
  })
})
