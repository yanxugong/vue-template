/*
 * @Descripttion:
 * @Author: yanxu gong
 * @Date: 2020-02-13 17:43:24
 * @LastEditors  : yanxu gong
 * @LastEditTime : 2020-02-14 16:14:50
 */
import Axios from './axios'
;(async () => {
  let res = await Axios('/data/1.txt', {
    headers: {
      a: 12,
      b: 'gxg gxg gxg'
    }
  })
  console.log(res)
})()
