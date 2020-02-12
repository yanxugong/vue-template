<!--
 * @Descripttion: 上传
 * @Author: yanxu gong
 * @Date: 2020-01-26 20:52:05
 * @LastEditors  : yanxu gong
 * @LastEditTime : 2020-02-12 17:23:59
 -->
<template>
  <div class="upload">
    <input type="file" @change="handleFileChange" />
    <el-button @click="handleUpload">上传</el-button>
    <el-button @click="handlePause" v-if="isPaused">暂停</el-button>
    <el-button @click="handleResume" v-else>恢复</el-button>
  </div>
</template>

<script>
const SIZE = 10 * 1024 * 1024 // 切片大小

export default {
  data: () => ({
    container: {
      file: null
    },
    data: [],
    isPaused: false,
    fakeUploadPercentage: 0
  }),
  watch: {
    uploadPercentage(newValue) {
      if (newValue > this.fakeUploadPercentage) {
        this.fakeUploadPercentage = newValue
      }
    }
  },
  computed: {
    uploadPercentage() {
      if (!this.container.file || !this.data.length) return 0
      const loaded = this.data
        .map(item => item.size * item.percentage)
        .reduce((acc, cur) => acc + cur)
      return parseInt((loaded / this.container.file.size).toFixed(2))
    }
  },
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
    request({
      url,
      method = 'post',
      data,
      headers = {},
      onProgress = e => e,
      requestList
    }) {
      return new Promise(resolve => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = onProgress
        xhr.open(method, url)
        Object.keys(headers).forEach(key =>
          xhr.setRequestHeader(key, headers[key])
        )
        xhr.send(data)
        xhr.onload = e => {
          // 将请求成功的 xhr 从列表中删除
          if (requestList) {
            const xhrIndex = requestList.findIndex(item => item === xhr)
            requestList.splice(xhrIndex, 1)
          }
          resolve({
            data: e.target.response
          })
        }
        requestList && requestList.push(xhr)
      })
    },
    createProgressHandler(item) {
      return e => {
        item.percentage = parseInt(String((e.loaded / e.total) * 100))
      }
    },
    // 生成文件 hash (web-worker)
    calculateHash(fileChunkList) {
      return new Promise(resolve => {
        // 添加 worker 属性
        this.container.worker = new Worker('/hash.js')
        this.container.worker.postMessage({ fileChunkList })
        this.container.worker.onmessage = e => {
          const { percentage, hash } = e.data
          this.hashPercentage = percentage
          if (hash) {
            resolve(hash)
          }
        }
      })
    },
    handlePause() {
      this.requestList.forEach(xhr => xhr?.abort())
      this.requestList = []
    },
    async verifyUpload(filename, fileHash) {
      const { data } = await this.request({
        url: 'http://localhost:3000/verify',
        headers: { 'content-type': 'application/json' },
        data: JSON.stringify({
          filename,
          fileHash
        })
      })
      return JSON.parse(data)
    },
    // 上传切片
    async uploadChunks(uploadedList = []) {
      const requestList = this.data
        .filter(({ hash }) => !uploadedList.includes(hash))
        .map(({ chunk, hash, index }) => {
          const formData = new FormData()
          formData.append('chunk', chunk)
          formData.append('hash', hash)
          formData.append('filename', this.container.file.name)
          return { formData, index }
        })
        .map(async ({ formData, index }) =>
          this.request({
            url: 'http://localhost:3000',
            data: formData,
            onProgress: this.createProgressHandler(this.data[index])
          })
        )
      await Promise.all(requestList) // 并发切片
      // 之前上传的切片数量 + 本次上传的切片数量 = 所有切片数量时
      // 合并切片
      if (uploadedList.length + requestList.length === this.data.length) {
        await this.mergeRequest()
      }
    },
    async mergeRequest() {
      await this.request({
        url: 'http://localhost:3000/merge',
        headers: { 'content-type': 'application/json' },
        data: JSON.stringify({ size: SIZE, filename: this.container.file.name })
      })
    },
    async handleResume() {
      const { uploadedList } = await this.verifyUpload(
        this.container.file.name,
        this.container.hash
      )
      await this.uploadChunks(uploadedList)
    },
    async handleUpload() {
      if (!this.container.file) return
      const fileChunkList = this.createFileChunk(this.container.file)
      this.container.hash = await this.calculateHash(fileChunkList)
      const { shouldUpload, uploadedList } = await this.verifyUpload(
        this.container.file.name,
        this.container.hash
      )
      if (!shouldUpload) {
        this.$message.success('秒传：上传成功')
        return
      }
      this.data = fileChunkList.map(({ file }, index) => ({
        fileHash: this.container.hash,
        chunk: file,
        index,
        hash: `${this.container.file.name}-${index}`, // 文件名 + 数组下标
        percentage: uploadedList.includes(index) ? 100 : 0
      }))
      await this.uploadChunks(uploadedList)
    }
  }
}
</script>
