/**
 * Copyright 2018 Scott Bender (scott@scottbender.net)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const {
  keys, map, padCharsStart, parseInt, sumBy, trimChars,
} = require('lodash/fp')

exports.mapI = map.convert({ cap: false })

// Build fastPacket. Use fastPacket.js createFastPackets() instead.
function getPlainPGNs(buffer) {
  var res = []
  var bucket = 0x40 // 64

  var first = new Buffer(8)
  first.writeUInt8(bucket++, 0)
  first.writeUInt8(buffer.length, 1)
  buffer.copy(first, 2, 0, 6)
  res.push(first)

  for ( var index = 6; index < buffer.length; index += 7 ) {
    var next = new Buffer(8)
    next.writeUInt8(bucket++, 0)
    var end = index+7
    var fill = 0
    if ( end > buffer.length ) {
      fill = end - buffer.length
      end = buffer.length
    }
    buffer.copy(next, 1, index, end)
    if ( fill > 0 ) {
      for ( var i = end-index; i < 8; i++ ) {
        next.writeUInt8(0xff, i)
      }
    }
    res.push(next)
  }
  return res
}
exports.getPlainPGNs = getPlainPGNs


const m_hex = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F'
]

function toHexString (v) {
  let msn = (v >> 4) & 0x0f
  let lsn = (v >> 0) & 0x0f
  return m_hex[msn] + m_hex[lsn]
}

function compute0183Checksum (sentence) {
  // skip the $
  let i = 1
  // init to first character
  let c1 = sentence.charCodeAt(i)
  // process rest of characters, zero delimited
  for (i = 2; i < sentence.length; ++i) {
    c1 = c1 ^ sentence.charCodeAt(i)
  }
  return '*' + toHexString(c1)
}
const hexByte = x => padCharsStart('0', 2, Number(x).toString(16))
const arrBuff = x => Uint8Array.from(x)
const hexArrBuff = x => arrBuff(x.map(parseInt(16)))
// Only use when it is a joined hex string.
const hexStrBuff = str => hexArrBuff(str.match(/.{1,2}/g))
// split string and then make buffer array
const hexSpStrBuff = (str, splitOn) => hexArrBuff(str.split(splitOn))
// Uint8Array map method doesn't work as expect. _.map does.
const buffHexArr = x => map(hexByte, new Uint8Array(x))
const buffHexStr = (data, separator = ',') => buffHexArr(data).join(separator)

function u8Concat(arrays, totalBytes) {
  const length = totalBytes || sumBy('byteLength', arrays)
  // console.log(totalBytes, sumBy('byteLength', arrays))
  let offset = 0
  return arrays.reduce(function(cbuf, buf, i) {
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
  while (i--) { // Compare each byte. Return false on first difference.
    if (view1.getUint8(i) !== view2.getUint8(i)) return false
  }
  return true // All bytes are equal.
}
const arrayBufferEqual = (buff1, buff2) => dataViewEqual(
  new DataView(buff1),
  new DataView(buff2),
)
exports.compute0183Checksum = compute0183Checksum
exports.arrBuff = arrBuff
exports.hexByte = hexByte
exports.hexArrBuff = hexArrBuff
exports.hexStrBuff = hexStrBuff
exports.hexSpStrBuff = hexSpStrBuff
exports.buffHexArr = buffHexArr
exports.buffHexStr = buffHexStr
exports.u8Concat = u8Concat
exports.dataViewEqual = dataViewEqual
exports.arrayBufferEqual = arrayBufferEqual
exports.buffArr = x => Array.from(new Uint8Array(x))
exports.trimWrap = trimChars('()<>[]')
exports.rmChecksum = str => str.includes('*') ? str.split('*', 1)[0] : str
exports.byteString = buffHexStr
