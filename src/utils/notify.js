import { request } from './request'
import { user } from './user'


class Notify {

  constructor() {
    this._init()
  }

  _init() {
    user.onLoginStatus(status => {
      this.status = status
      if (status) {
        this._notify()
      } else {
        this._notifyOff()
      }
    })
  }

  _notify = () => {
    if (!this.status) {
      return
    }
    this._request = request({
      url: 'notify'
    })
    this._request.then(res => {
      this._notify()
      if (res.type) {
        const list = this._callbacks[res.type]
        list?.map(callback => callback(res.params))
      }
    }).catch(err => {
      console.error('通知请求错误 将在稍后重试', err)
      setTimeout(() => {
        this._notify()
      }, 2000)
    })
  }

  _notifyOff = () => {
    this._request?.abort?.()
  }

  _callbacks = []

  on = (type, callback) => {
    if (!this._callbacks[type]) {
      this._callbacks[type] = []
    }
    const list = this._callbacks[type]
    list.push(callback)
    return {
      remove: () => {
        const index = list.indexOf(callback)
        if (~index) {
          list.splice(index)
        }
      }
    }
  }
}

export const notify = new Notify()
