/*
 * @Descripttion:
 * @Author: yanxu gong
 * @Date: 2020-02-21 17:56:26
 * @LastEditors: yanxu gong
 * @LastEditTime: 2020-02-21 17:56:39
 */
export function deepCopy(obj) {
  let result = obj.constructor === Array ? [] : {}
  for (let i in obj) {
    result[i] = typeof obj[i] === 'object' ? deepCopy(obj[i]) : obj[i]
  }
  return result
}
