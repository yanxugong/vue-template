/*
 * @Descripttion:
 * @Author: yanxu gong
 * @Date: 2020-02-14 13:39:20
 * @LastEditors  : yanxu gong
 * @LastEditTime : 2020-02-14 16:04:56
 */
export default function request(options) {
  console.log(options)
  let xhr = new XMLHttpRequest()
  xhr.open(options.method, options.url, true)
  for (const name in options.headers) {
    xhr.setRequestHeader(
      encodeURIComponent(name),
      encodeURIComponent(options.headers[name])
    )
  }
  xhr.send(options.data)
  return new Promise((resolve, reject) => {
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr)
        } else {
          reject(xhr)
        }
      }
    }
  })
}
