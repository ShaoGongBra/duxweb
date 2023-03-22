import { createRequest, createUpload } from './net'
import { System } from './system'
import { user } from './user'
import { qiniu } from './net/uploadDrive/qiniu'

const mainConfigData = {
  config: {
    request: {
      contentType: 'application/json',
      header: () => {
        return {
          Accept: 'application/json'
        }
      }
    },
    upload: {
      api: 'tools/upload',
      requestField: 'file',
      resultField: ['data', 'data', 'list', 0, 'url'],
      // 第三方默认上传驱动，为空使用本地上传
      defaultDrive: ''
    }
  },

}

const { request, throttleRequest, middle: requestMiddle, config: requestConfig } = createRequest({
  ...mainConfigData,
  middle: {
    before: [
      async params => {
        // 用户信息
        const userInfo = user.getUserInfo()
        if (userInfo?.token) {
          params.header.Authorization = userInfo.token
        }
        return params
      }
    ],
    result: [
      async (res, params) => {
        if (res.statusCode === 401) {
          await user.login()
          return await request(params)
        }
        return res
      }
    ]
  }
})

const qiniuDrive = qiniu()
qiniuDrive.configSync(async () => {
  const res = await request('tools/uploadQiniu')
  return {
    host: res.public_url,
    token: res.token
  }
})

const { upload, uploadTempFile, middle: uploadMiddle } = createUpload({
  ...mainConfigData,
  drives: {
    qiniu: qiniuDrive
  },
  middle: {
    before: [
      async params => {
        // 用户信息
        const userInfo = user.getUserInfo()
        if (userInfo?.token) {
          params.header.Authorization = userInfo.token
        }
        return params
      }
    ]
  }
})
requestConfig({
  request: {
    path: System.current
  }
})

export { request, throttleRequest, requestMiddle, requestConfig, upload, uploadTempFile, uploadMiddle }
