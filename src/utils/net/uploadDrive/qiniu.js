import * as qiniuUtil from 'qiniu-js'
import md5 from 'crypto-js/md5'

export const qiniu = () => {
  /**
   * 配置
   */
  const config = {
    token: '',
    // 图片访问域名
    host: '',
    // 异步获取配置
    syncCallback: null,
  }

  const setConfig = ({ token, host, endpoint }) => {
    if (token) {
      config.token = token
    }
    if (host) {
      config.host = host
    }
    if (endpoint) {
      config.endpoint = endpoint
    }
  }

  const initToken = async () => {
    if (config.token) {
      return
    }
    if (!config.syncCallback) {
      throw '请注册获取配置的异步函数'
    }
    const _config = await config.syncCallback()
    setConfig(_config)
  }

  const isReady = () => (!!config.token && !!config.endpoint && !!config.host) || !!config.syncCallback

  return {
    isReady,
    configSync: callback => {
      config.syncCallback = callback
    },
    config: setConfig,
    upload: async ({
      file,
      progress,
      getKey
    }) => {
      await initToken()
      if (!isReady()) {
        console.error('七牛云上传参数错误 请配置参数后重试')
        throw '七牛云上传参数错误 请配置参数后重试'
      }
      return new Promise((resolve, reject) => {
        const observable = qiniuUtil.upload(
          file,
          getKey?.() || md5(new Date().getTime() + '') + '.' + file.name.split('.').reverse()[0],
          config.token
        )
        observable.subscribe({
          next({ total }) {
            progress?.(total)
          },
          error(err) {
            reject(err)
          },
          complete(res) {
            resolve({
              ...res,
              mime: file.type,
              size: file.size,
              name: file.name,
              url: config.host + '/' + res.key
            })
          }
        })
      })
    }
  }
}