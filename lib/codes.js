const {
  flow, invert, map, propertyOf,
} = require('lodash/fp')
const manufacturerNames = require('./codesMfgs.json')
const { codes: classFunCodes } = require('./classFunctionCodes')

const industryCodes = [
  [0, 'Global'],
  [1, 'Highway'],
  [2, 'Agriculture'],
  [3, 'Construction'],
  [4, 'Marine'],
  [5, 'Industrial'],
]
const priorityCodes = [
  [2, 'Alarms, safety, and network critical messages'],
  [3, 'Commands, real-time data, and mission critical proprietary messages'],
  [5, 'Non-critical messages (status and data)'],
  [6, 'Non-critical messages (status and data)'],
  [7, 'Multi-packet messages or Proprietary messages'],
]
// This is just a total guess.
const categoryDefaultPriority = {
  Steering: 2,
  Propulsion: 2,
  Navigation: 2,
  Power: 3,
  AIS: 4,
  Environmental: 5,
  'General & or Mandatory': 6,
}
const defaultTransmitPGNs = [
  60928,
  59904,
  126996,
  126464,
  128267,
  129794,
  129038,
  129041,
  127505,
  127506,
  127508,
  129026,
  129025,
  129029,
  127250,
  130306,
  126720,
  127489,
  127488,
]

const createMapIndex = (id) => flow(
  map((x) => ([x[id], x])),
  (x) => new Map(x),
  (mapIndex) => (key) => mapIndex.get(key),
)
const codeIndex = createMapIndex('code')
module.exports.getClass = codeIndex(classFunCodes.map((x) => ({
  ...x,
  getFunction: codeIndex(x.functions),
})))

const manufacturerCodes = invert(manufacturerNames)
module.exports.manufacturerCodes = manufacturerCodes
module.exports.industryCodes = industryCodes
module.exports.categoryDefaultPriority = categoryDefaultPriority
module.exports.priorityCodes = priorityCodes
module.exports.getIndustryName = propertyOf(industryCodes)
module.exports.getManufacturerName = propertyOf(manufacturerCodes)
// module.exports.getIndustryCode = propertyOf(industryNames)
module.exports.getManufacturerCode = propertyOf(manufacturerNames)
// module.exports.getDeviceClassName = propertyOf(deviceClassCodes)
module.exports.defaultTransmitPGNs = defaultTransmitPGNs
