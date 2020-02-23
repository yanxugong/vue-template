/*
 * @Descripttion:
 * @Author: yanxu gong
 * @Date: 2020-02-23 15:57:24
 * @LastEditors: yanxu gong
 * @LastEditTime: 2020-02-23 16:23:22
 */
const express = require('express')
const app = express()

app.use(require('cors')())

app.get('/download', (req, res) => {
  console.log('ok')
  res.download('./../public/X-00001.xml')
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
