const { getClass, getManufacturerCode, getManufacturerName } = require('./codes')

/* globals describe test expect */
describe('getClass', () => {
  test('Return correct class info', () => {
    expect(getClass(10).label).toBe('System Tools')
  })
  test('Return correct class function info', () => {
    expect(getClass(10).getFunction(140).label).toBe('Bus Traffic Logger')
  })
})

describe('getManufacturerCode', () => {
  test('Return mfg number from name string', () => {
    expect(getManufacturerCode('Furuno')).toBe(1855)
    expect(getManufacturerCode('Yacht Devices')).toBe(717)
  })
})

describe('getManufacturerName', () => {
  test('Return name string from mfg number', () => {
    expect(getManufacturerName(1855)).toBe('Furuno')
    expect(getManufacturerName(717)).toBe('Yacht Devices')
  })
})
