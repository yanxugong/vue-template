/*
 * @Descripttion:
 * @Author: yanxu gong
 * @Date: 2020-02-14 11:24:50
 * @LastEditors  : yanxu gong
 * @LastEditTime : 2020-02-14 13:44:28
 */
export function assert(exp, msg = 'assert faild') {
  throw new Error(msg)
}

export function merge(dest, src) {
  for (let name in src) {
    if (typeof src[name] === 'object') {
      if (!dest[name]) {
        dest[name] = {}
      }
      merge(dest[name], src[name])
    } else {
      dest[name] = src[name]
    }
  }
}
