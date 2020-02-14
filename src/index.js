import Axios from './axios'

// console.log(axios.default)
// axios({ url: '1.txt', method: 'post' })
// axios.get('1.txt', { headers: { aaa: 123 } })
// axios.post('1.txt', { data: 123 }, { headers: { bbb: 123 } })

let axios = Axios.create({
  baseUrl: 'aaa',
  headers: {
    common: {
      aaa: 123
    }
  }
})
console.log(axios.default)
let axios2 = Axios.create({
  baseUrl: 'bbb'
})
console.log(axios2.default)
