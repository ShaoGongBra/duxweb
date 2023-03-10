import { createRequest, createUpload } from './net'
import { System } from './system'
import { user } from './user'

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
      resultField: ['data', 'data', 'list', 0, 'url']
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

const { upload, uploadTempFile, middle: uploadMiddle } = createUpload({
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
    ]
  }
})

System.onChange(system => {
  requestConfig({
    request: {
      path: system
    }
  })
})

export { request, throttleRequest, requestMiddle, requestConfig, upload, uploadTempFile, uploadMiddle }
