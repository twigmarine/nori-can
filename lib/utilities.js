const {
  map, padCharsStart, parseInt, sumBy, trim, trimChars,
} = require('lodash/fp')

exports.mapI = map.convert({ cap: false })

const hexByte = (x) => padCharsStart(
  '0', 2, Number(x).toString(16).toUpperCase(),
)
const arrBuff = (x) => Uint8Array.from(x)
const hexArrBuff = (x) => arrBuff(x.map(parseInt(16)))
// Only use when it is a joined hex string.
const hexStrBuff = (str) => hexArrBuff(str.match(/.{1,2}/g))
// split string and then make buffer array
const hexSpStrBuff = (str, splitOn) => hexArrBuff(str.split(splitOn))
// Uint8Array map method doesn't work as expect. _.map does.
const buffHexArr = (x) => map(hexByte, new Uint8Array(x))
const buffHexStr = (data, separator = ',') => buffHexArr(data).join(separator)
const buffStr = (buf) => String.fromCharCode.apply(null, new Uint8Array(buf))
const dataStr = (data) => trim(buffStr(data.buffer))

function u8Concat(arrays, totalBytes) {
  const length = totalBytes || sumBy('byteLength', arrays)
  // console.log(totalBytes, sumBy('byteLength', arrays))
  let offset = 0
  return arrays.reduce((cbuf, buf) => {
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
const arrayBufferEqual = (buff1, buff2) => dataViewEqual(
  new DataView(buff1),
  new DataView(buff2),
)

exports.arrBuff = arrBuff
exports.hexByte = hexByte
exports.hexArrBuff = hexArrBuff
exports.hexStrBuff = hexStrBuff
exports.hexSpStrBuff = hexSpStrBuff
exports.buffHexArr = buffHexArr
exports.buffHexStr = buffHexStr
exports.buffStr = buffStr
exports.dataStr = dataStr
exports.u8Concat = u8Concat
exports.dataViewEqual = dataViewEqual
exports.arrayBufferEqual = arrayBufferEqual
exports.buffArr = (x) => Array.from(new Uint8Array(x))
exports.trimWrap = trimChars('()<>[]')
exports.rmChecksum = (str) => (str.includes('*') ? str.split('*', 1)[0] : str)
exports.byteString = buffHexStr
