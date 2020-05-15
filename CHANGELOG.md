## 2.9.0
* `parse()` will now look for field `default` property when field value is undefined.

## 2.8.0
* Allow `createGetInfo()` to accept input with `id` for direct match instead of `pgn` + match values.
* `getFieldData()` via `encode()` will now force use of `match` value when found the field info.
* `parse()` will not try to restoreFastPacket if `data` is over 8 bytes.
* `encode()` will replace `dst` if pgn is global only. `canId` property added to result.
* `addCanId()` helper function added.

## 2.7.2
* Fix to `encodeCanId()` not handling some PGNs correctly. Added tests.

## 2.6
* Create `processBinary()` function to handle raw binary with arbitrary field definition.
* Fix `pgnInfoById()`. Use _.flatten instead of _.compact.

## 2.5
* Better encode support
* `data` should be a Uint8Array.

## 1.1
* Add processStringInput() export.
