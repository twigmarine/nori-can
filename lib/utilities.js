const {
  flow, isTypedArray, map, overArgs, padCharsStart, parseInt, sumBy, trimChars,
} = require('lodash/fp')

const hexByte = (x) => padCharsStart(
  '0', 2, Number(x).toString(16).toUpperCase(),
)
const arrBuff = (x) => Uint8Array.from(x)
const hexArrBuff = (x) => arrBuff(x.map(parseInt(16)))
// Only use when it is a joined hex string.
const hexStrBuff = (str) => hexArrBuff(str.match(/.{1,2}/g))
// split string and then make buffer array
const hexSpStrBuff = (str) => hexArrBuff(str.split(str[2]))
const isSolidHex = (x) => x.match(/^[a-fA-F0-9]+$/)
const hexToBuff = (x) => (isSolidHex(x) ? hexStrBuff(x) : hexSpStrBuff(x))
const toView = (x) => new DataView(x.buffer || x)
const hexToView = flow(hexToBuff, toView)
// Uint8Array map method doesn't work as expect. _.map does.
const buffHexArr = (x) => map(hexByte, new Uint8Array(x))
const buffHexStr = (data, separator = ',') => buffHexArr(data).join(separator)
const codeStr = (codes) => String.fromCharCode(...codes)
const buffStr = (buf) => codeStr(new Uint8Array(buf))
const buffStr16 = (buf) => codeStr(new Uint16Array(buf))
const dataStr = (data) => trimChars(
  codeStr([0x00, 0x20, 0xFF]),
  buffStr(data.buffer),
)

function u8Concat(arrays, totalBytes) {
  const length = totalBytes || sumBy('byteLength', arrays)
  let offset = 0
  return arrays.reduce((cbuf, bufOrTarr) => {
    const buf = isTypedArray(bufOrTarr) ? bufOrTarr : new Uint8Array(bufOrTarr)
    const nextOffset = offset + buf.byteLength
    if (nextOffset > length) {
      cbuf.set(buf.slice(0, length - nextOffset), offset)
    } else {
      cbuf.set(buf, offset)
    }
    offset = nextOffset
    return cbuf
  }, new Uint8Array(length))
}

// Compare DataViews
function dataViewEqual(view1, view2) {
  if (view1 === view2) return true // Same exact instance. Why even bother?!
  if (view1.byteLength !== view2.byteLength) return false // Different size.
  let i = view1.byteLength
  while (i--) { // eslint-disable-line no-plusplus
    // Compare each byte. Return false on first difference.
    if (view1.getUint8(i) !== view2.getUint8(i)) return false
  }
  return true // All bytes are equal.
}
const arrayBufferEqual = overArgs(dataViewEqual, [toView, toView])

module.exports = {
  arrayBufferEqual,
  arrBuff,
  buffArr: (x) => Array.from(new Uint8Array(x)),
  buffHexArr,
  buffHexStr,
  buffStr,
  buffStr16,
  byteString: buffHexStr,
  dataStr,
  dataViewEqual,
  hexByte,
  hexArrBuff,
  hexStrBuff,
  hexSpStrBuff,
  hexToBuff,
  hexToView,
  isSolidHex,
  mapI: map.convert({ cap: false }),
  rmChecksum: (str) => (str.includes('*') ? str.split('*', 1)[0] : str),
  trimWrap: trimChars('()<>[]'),
  u8Concat,
}
