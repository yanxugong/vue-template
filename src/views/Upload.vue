<!--
 * @Descripttion: 上传
 * @Author: yanxu gong
 * @Date: 2020-01-26 20:52:05
 * @LastEditors  : yanxu gong
 * @LastEditTime : 2020-02-13 13:37:08
 -->
<template>
  <div>
    <div class="upload">
      <input
        type="file"
        :disabled="status !== Status.wait"
        @change="handleFileChange"
      />
      <el-button @click="handleUpload" :disabled="uploadDisabled"
        >上传</el-button
      >
      <el-button @click="handleResume" v-if="status === Status.pause"
        >恢复</el-button
      >
      <el-button
        v-else
        @click="handlePause"
        :disabled="status !== Status.uploading || !container.hash"
        >暂停</el-button
      >
    </div>
    <div>
      <div>计算文件 hash</div>
      <el-progress :percentage="hashPercentage"></el-progress>
      <div>总进度</div>
      <el-progress :percentage="fakeUploadPercentage"></el-progress>
    </div>
    <el-table :data="data">
      <el-table-column
        prop="hash"
        label="切片hash"
        align="center"
      ></el-table-column>
      <el-table-column label="大小(KB)" align="center" width="120">
        <template v-slot="{ row }">
          {{ row.size | transformByte }}
        </template>
      </el-table-column>
      <el-table-column label="进度" align="center">
        <template v-slot="{ row }">
          <el-progress
            :percentage="row.percentage"
            color="#909399"
          ></el-progress>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
const SIZE = 10 * 1024 * 1024 // 切片大小

const Status = {
  wait: 'wait',
  pause: 'pause',
  uploading: 'uploading'
}

export default {
  filters: {
    transformByte(val) {
      return Number((val / 1024).toFixed(0))
    }
  },
  data: () => ({
    Status,
    container: {
      file: null,
      hash: '',
      worker: null
    },
    hashPercentage: 0,
    data: [],
    requestList: [],
    status: Status.wait,
    // 当暂停时会取消 xhr 导致进度条后退
    // 为了避免这种情况，需要定义一个假的进度条
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
    uploadDisabled() {
      return (
        !this.container.file ||
        [Status.pause, Status.uploading].includes(this.status)
      )
    },
    uploadPercentage() {
      if (!this.container.file || !this.data.length) return 0
      const loaded = this.data
        .map(item => item.size * item.percentage)
        .reduce((acc, cur) => acc + cur)
      return parseInt((loaded / this.container.file.size).toFixed(2))
    }
  },
  methods: {
    handlePause() {
      this.status = Status.pause
      this.resetData()
    },
    resetData() {
      this.requestList.forEach(xhr => xhr?.abort())
      this.requestList = []
      if (this.container.worker) {
        this.container.worker.onmessage = null
      }
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
        // 暴露当前 xhr 给外部
        requestList && requestList.push(xhr)
      })
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
    handleFileChange(e) {
      const [file] = e.target.files
      if (!file) return
      this.resetData()
      // 将当前状态的data重置为初始状态
      Object.assign(this.$data, this.$options.data())
      this.container.file = file
    },
    createProgressHandler(item) {
      return e => {
        item.percentage = parseInt(String((e.loaded / e.total) * 100))
      }
    },
    async handleResume() {
      this.status = Status.uploading
      const { uploadedList } = await this.verifyUpload(
        this.container.file.name,
        this.container.hash
      )
      await this.uploadChunks(uploadedList)
    },
    async handleUpload() {
      if (!this.container.file) return
      this.status = Status.uploading
      const fileChunkList = this.createFileChunk(this.container.file)
      this.container.hash = await this.calculateHash(fileChunkList)

      const { shouldUpload, uploadedList } = await this.verifyUpload(
        this.container.file.name,
        this.container.hash
      )
      if (!shouldUpload) {
        this.$message.success('秒传：上传成功')
        this.status = Status.wait
        return
      }

      this.data = fileChunkList.map(({ file }, index) => ({
        fileHash: this.container.hash,
        index,
        hash: `${this.container.file.name}-${index}`, // 文件名 + 数组下标
        chunk: file,
        size: file.size,
        percentage: uploadedList.includes(index) ? 100 : 0
      }))

      await this.uploadChunks(uploadedList)
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
          formData.append('fileHash', this.container.hash)
          return { formData, index }
        })
        .map(async ({ formData, index }) =>
          this.request({
            url: 'http://localhost:3000',
            data: formData,
            onProgress: this.createProgressHandler(this.data[index]),
            requestList: this.requestList
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
        data: JSON.stringify({
          size: SIZE,
          fileHash: this.container.hash,
          filename: this.container.file.name
        })
      })
      this.$message.success('上传成功')
      this.status = Status.wait
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
    }
  }
}
</script>
