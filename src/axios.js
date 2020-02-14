/*
 * @Descripttion:
 * @Author: yanxu gong
 * @Date: 2020-02-14 11:28:11
 * @LastEditors  : yanxu gong
 * @LastEditTime : 2020-02-14 14:17:19
 */
import _default from './default'
import { merge, assert } from './common'
import request from './request'

class Axios {
  constructor() {
    let _this = this
    return new Proxy(request, {
      get(data, name) {
        return _this[name]
      },
      set(data, name, val) {
        _this[name] = val
        return true
      },
      apply(fn, thisArg, args) {
        console.log(fn, thisArg, args)
      }
    })
  }

  _preprocessArgs(method, ...args) {
    let options
    if (args.length === 1 && typeof args[0] === 'string') {
      options = { method, url: args[0] }
    } else if (args.length === 1 && args[0].constructor === Object) {
      options = {
        ...args[0],
        method
      }
    } else {
      return undefined
    }
    console.log(options)
    return options
  }

  get(...args) {
    let options = this._preprocessArgs('get', args)
    if (!options) {
      if (args.length == 2) {
        assert(typeof args[0] == 'string', 'args[0] must is string')
        assert(
          typeof args[1] == 'object' &&
            args[1] &&
            args[1].constructor == Object,
          'args[1] must is JSON'
        )
        options = {
          ...args[1],
          url: args[0],
          method: 'get'
        }
        console.log(options)
      } else {
        assert(false, 'invaild args')
      }
    }
  }

  post(...args) {
    let options = this._preprocessArgs('post', args)

    if (!options) {
      if (args.length == 2) {
        assert(typeof args[0] == 'string', 'args[0] must is string')
        options = {
          url: args[0],
          data: args[1],
          method: 'post'
        }

        console.log(options)
      } else if (args.length == 3) {
        assert(typeof args[0] == 'string', 'args[0] must is string')
        assert(
          typeof args[2] == 'object' &&
            args[2] &&
            args[2].constructor == Object,
          'args[2] must is JSON'
        )
        options = {
          ...args[2],
          url: args[0],
          data: args[1],
          method: 'post'
        }
        console.log(options)
      } else {
        assert(false, 'invaild argments')
      }
    }
  }

  delete(...args) {
    let options = this._preprocessArgs('delete', args)

    if (!options) {
      assert(typeof args[0] == 'string', 'args[0] must is string')
      assert(
        typeof args[1] == 'object' && args[1] && args[1].constructor == Object,
        'args[1] must is JSON'
      )

      options = {
        ...args[1],
        url: args[0],
        method: 'get'
      }

      console.log(options)
    }
  }
}

Axios.create = Axios.prototype.create = function(option = {}) {
  let axios = new Axios()
  let res = { ...JSON.parse(JSON.stringify(_default)) }
  merge(res, option)
  axios.default = res
  return axios
}

export default Axios.create()
