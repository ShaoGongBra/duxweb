import md5 from 'crypto-js/md5'
import { loadScript } from '../../util'

export const ctyun = () => {
  /**
   * 配置
   */
  const config = {
    endpoint: '',
    bucket: '',
    accessKeyId: '',
    secretAccessKey: '',
    sessionToken: '',
    publicUrl: '',
    // 异步获取配置
    syncCallback: null,
    s3Client: null,
  }

  const setConfig = ({ endpoint, bucket, accessKeyId, secretAccessKey, sessionToken, publicUrl }) => {
    if (endpoint) {
      config.endpoint = endpoint
    }
    if (bucket) {
      config.bucket = bucket
    }
    if (accessKeyId) {
      config.accessKeyId = accessKeyId
    }
    if (secretAccessKey) {
      config.secretAccessKey = secretAccessKey
    }
    if (sessionToken) {
      config.sessionToken = sessionToken
    }
    if (publicUrl) {
      config.publicUrl = publicUrl
    }
  }

  const initToken = async () => {
    if (!window.AWS) {
      await loadScript('https://help.qhoss.xstore.ctyun.cn/sdk/javascript/1.0/oos-js-sdk.js')
    }
    if (config.sessionToken) {
      return
    }
    if (!config.syncCallback) {
      throw '请注册获取配置的异步函数'
    }
    const _config = await config.syncCallback()
    setConfig(_config)

    config.s3Client = new AWS.S3({
      credentials: config,
      endpoint: config.endpoint,
    })

  }

  const isReady = () => (!!config.accessKeyId && !!config.secretAccessKey && !!config.sessionToken) || !!config.syncCallback

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
        console.error('天翼云上传参数错误 请配置参数后重试')
        throw '天翼云上传参数错误 请配置参数后重试'
      }
      return new Promise((resolve, reject) => {

        const upload = new AWS.S3.ManagedUpload({
          service: config.s3Client,
          partSize: 20 * 1024 * 1024, // 20M一片，可以根据需要自己定义，每个文件不能超过10000分片
          params: {
            Bucket: config.bucket,
            Key: getKey?.() || md5(new Date().getTime() + '') + '.' + file.name.split('.').reverse()[0],
            Body: file,
            ACL: 'public-read', // 初始化acl权限，默认为private，'private'|'public-read'|'public-read-write'
            // ContentType: 'text/plain', // 设置contentType, 默认是application/octet-stream
          },
        })

        upload.on('httpUploadProgress', _progress => {
          progress?.({
            loaded: _progress.loaded,
            size: _progress.total,
            percent: _progress.loaded / _progress.total * 100
          })
        })

        upload.send((err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve({
              key: res.Key,
              mime: file.type,
              size: file.size,
              name: file.name,
              url: config.publicUrl + '/' + res.Key
            })
          }
        })
      })
    }
  }
}