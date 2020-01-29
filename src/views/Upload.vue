<!--
 * @Descripttion: 上传
 * @Author: voanit
 * @Date: 2020-01-26 20:52:05
 * @LastEditors  : yanxu gong
 * @LastEditTime : 2020-01-29 15:05:35
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
      file: null,
      data: []
    }
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
      let memory = 0
      while (memory < file.size) {
        fileChunkList.push({ file: file.slice(memory, memory + size) })
        memory += size
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
    },
    async handleUpload() {
      if (!this.container.file) return
      const fileChunkList = this.createFileChunk(this.contanier.file)
      this.data = fileChunkList.map(({ file }, index) => ({
        chunk: file,
        hash: `${this.container.file.name}-${index}` // 文件名 + 数组下标
      }))
      await this.uploadChunks()
    }
  }
}
</script>
