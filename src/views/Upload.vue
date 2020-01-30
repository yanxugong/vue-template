<!--
 * @Descripttion: 上传
 * @Author: yanxu gong
 * @Date: 2020-01-26 20:52:05
 * @LastEditors  : yanxu gong
 * @LastEditTime : 2020-01-30 18:53:00
 -->
<template>
  <div class="upload">
    <input type="file" @change="handleFileChange" />
    <el-button @click="handleUpload">上传</el-button>
  </div>
</template>

<script>
const SIZE = 10 * 1024 * 1024 // 切片大小

export default {
  data: () => ({
    container: {
      file: null
    },
    data: []
  }),
  methods: {
    handleFileChange(e) {
      const [file] = e.target.files
      if (!file) return
      // 将当前状态的data重置为初始状态
      Object.assign(this.$data, this.$options.data())
      this.container.file = file
    },
    // 生成文件切片
    createFileChunk(file, size = SIZE) {
      const fileChunkList = []
      let sum = 0
      // 当满足条件时进入循环，进入循环后，当条件不满足时，跳出循环
      while (sum < file.size) {
        fileChunkList.push({ file: file.slice(sum, sum + size) })
        sum += size
      }
      return fileChunkList
    },
    request({ url, method = 'post', data, headers = {}, requestList }) {
      return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.open(method, url)
        Object.keys(headers).forEach(key =>
          xhr.setRequestHeader(key, headers[key])
        )
        xhr.send(data)
        xhr.onload = e => {
          resolve({
            data: e.target.response
          })
        }
      })
    },
    // 上传切片
    async uploadChunks() {
      const requestList = this.data
        .map(({ chunk, hash }) => {
          const formData = new FormData()
          formData.append('chunk', chunk)
          formData.append('hash', hash)
          formData.append('filename', this.container.file.name)
          return { formData }
        })
        .map(async ({ formData }) =>
          this.request({ url: 'http://localhost:3000', data: formData })
        )
      await Promise.all(requestList) // 并发切片
      await this.mergeRequest()
    },
    async mergeRequest() {
      await this.request({
        url: 'http://localhost:3000/merge',
        headers: { 'content-type': 'application/json' },
        data: JSON.stringify({ filename: this.container.file.name })
      })
    },
    async handleUpload() {
      if (!this.container.file) return
      const fileChunkList = this.createFileChunk(this.container.file)
      debugger
      this.data = fileChunkList.map(({ file }, index) => ({
        chunk: file,
        hash: `${this.container.file.name}-${index}` // 文件名 + 数组下标
      }))
      await this.uploadChunks()
    }
  }
}
</script>
