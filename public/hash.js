/*
 * @Descripttion: 根据文件内容计算出文件的 hash 值
 * @Author: yanxu gong
 * @Date: 2020-02-02 11:11:54
 * @LastEditors  : yanxu gong
 * @LastEditTime : 2020-02-02 11:23:43
 */
self.importScripts('/spark-md5.min.js')

// 生成文件 hash
self.onmessage = e => {
  const { fileChunkList } = e.data
  const spark = new self.SparkMD5.ArrayBuffer()
  let percentage = 0
  let count = 0
  const loadNext = index => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(fileChunkList[index].file)
    reader.onload = e => {
      count++
      spark.append(e.target.result)
      if (count === fileChunkList.length) {
        self.postMessage({
          percentage: 100,
          hahs: spark.end()
        })
        self.close()
      } else {
        percentage += 100 / fileChunkList.length
        self.postMessage({
          percentage
        })
        // 递归计算下一个切片
        loadNext(count)
      }
    }
  }
  loadNext(0)
}
