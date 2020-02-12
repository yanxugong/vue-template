/*
 * @Descripttion:
 * @Author: yanxu gong
 * @Date: 2020-01-30 12:34:28
 * @LastEditors  : yanxu gong
 * @LastEditTime : 2020-02-12 18:02:08
 */
const Controller = require('./controller')
const http = require('http')
const server = http.createServer()

const controller = new Controller()

server.on('request', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  if (req.method === 'options') {
    res.status = 200
    res.end()
    return
  }

  if (req.url === '/verify') {
    await controller.handleVerifyUpload(req, res)
    return
  }

  if (req.url === '/merge') {
    await controller.handleMerge(req, res)
    return
  }

  if (req.url === '/') {
    await controller.handleFormData(req, res)
  }
})

server.listen(3000, () => console.log('正在监听 3000 端口'))
