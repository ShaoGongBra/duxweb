import { useEffect, useState, useMemo } from 'react'
import { QuickEvent } from './QuickEvent'
import { ObjectManage } from './data'
import { System } from './system'

class UserManage extends ObjectManage {
  constructor(option) {
    super(option)
    this.quickEvent.on((data, type) => {
      if (type === 'cache') {
        // 从本地读取的用户信息 调用模块接口判断是否是登录状态
        if (this.getCurrentConfig()?.isLogin?.(data?.[System.current])) {
          this.setLoginStatus(true, 'local')
        }
      }
    })
  }

  // 当前配置
  config = {
    // 当前的登录状态
    loginStatus: false,
    // 登录类型
    loginType: 'local',
    // 登录成功回调
    loginEvent: new QuickEvent()
  }

  // 注册的登录配置
  appConfigs = {}

  /**
   * 注册登录配置
   * @param {object} config 配置内容
   * @param {string} name 配置名称
   */
  register = (config, name = '_default') => {
    this.appConfigs[name] = { ...this.appConfigs[name], ...config }
  }

  /**
   * 获取当前登录配置
   * @returns
   */
  getCurrentConfig = () => {
    return {
      ...this.appConfigs._default,
      ...this.appConfigs[System.current]
    }
  }

  /**
   * 获取模块用户信息
   * @returns
   */
  getUserInfo = () => {
    return { ...this.data[System.current], status: this.data.status }
  }

  /**
   * 使用合并的方式设置用户信息
   * @param {object} info 用户信息
   * setInfo({avatar: ''})
   */
  setInfo = info => {
    this.set(old => {
      old[System.current] = { ...old[System.current], ...info }
      return { ...old }
    })
    return user.data
  }

  /**
   * 通过键设置属性
   * @param {string} key 用户信息字段
   * @param {any} value 需要设置的值
   */
  setKey = (key, value) => {
    return this.setInfo({ [key]: value })
  }

  /**
   * 判断是否登录
   */
  isLogin = (openLogin, callback) => {
    const loginStatus = this.config.loginStatus || this.getCurrentConfig()?.devOpen
    !!openLogin && !loginStatus && this.login().then(callback)
    return loginStatus
  }

  /**
   * 获取当前登录的用户id
   */
  getUserID = () => {
    return this.getCurrentConfig()?.getUserID(this.getUserInfo())
  }

  /**
   * 去登录
   */
  login = async () => {
    return new Promise((resolve, reject) => {
      if (this.isLogin()) {
        this.loginOut()
      }
      const { remove } = this.onLoginStatus(status => {
        status && resolve() || reject()
        remove()
      })
    })
  }

  /**
   * 退出登录
   */
  loginOut = async () => {
    delete this.data[System.current]
    this.setInfo({ ...this.data })
    // this.setLoginStatus(false)
    location.reload()
  }

  // 登录状态监听 登录和退出登录都会监听
  loginEvent = new QuickEvent()
  // 监听登录状态
  onLoginStatus = callback => {
    if (this.config.loginStatus) {
      callback(true, this.config.loginType)
    }
    return this.loginEvent.on(callback)
  }

  /**
   * 设置登录状态
   * @param {boolean} status true登录 false退出登录
   * @param {string} type local从本地登录 dev调试模式登录 account账号登录 weapp小程序登录 wechat微信登录 appwechat app端微信登录
   */
  setLoginStatus = (status, type = 'local') => {
    // 防止重复执行
    if (status === this.config.loginStatus) return
    this.config.loginStatus = status
    this.config.loginType = type
    this.loginEvent.trigger(status, type)
  }
}

/**
 * 用户管理
 */
export const user = new UserManage({
  cacheKey: 'userInfo',
  cache: true
})

/**
 * 用户信息hook
 * @returns [userInfo, action]
 */
export const useUserInfo = () => {
  const defaultData = useMemo(() => user.getUserInfo(), [])

  const [data, setData] = useState(defaultData)

  useEffect(() => {
    const { remove } = user.onSet(_data => setData(_data?.[System.current]))
    return () => remove()
  }, [])

  const result = useMemo(() => [data, user], [data])

  return result
}
