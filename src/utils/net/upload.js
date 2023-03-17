import { getUrl, execGetChild, execGetObject, getInputFile, execMiddle } from './util'
import { imageAction } from './image'

const uploadFile = (() => {
  const createFormData = (file, body = {}, name) => {
    const data = new FormData()
    Object.keys(body).forEach(key => {
      data.append(key, body[key])
    })
    data.append(name, file)
    return data
  }

  return opts => {
    const { url, timeout = 60000, file, name, header, formData } = opts
    const xhr = new XMLHttpRequest()
    const execFetch = new Promise((resolve, reject) => {
      xhr.open('POST', url)
      xhr.responseType = 'text'
      // 上传进度
      xhr.upload.onprogress = e => {
        progressFunc?.({
          progress: e.lengthComputable ? (e.loaded / e.total) * 100 : 0,
          totalBytesSent: e.loaded,
          totalBytesExpectedToSend: e.total
        })
      }
      // 请求头
      for (const key in header) {
        if (header.hasOwnProperty.call(header, key)) {
          xhr.setRequestHeader(key, header[key])
        }
      }
      // 请求成功
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve({
            data: xhr.response,
            errMsg: 'ok',
            statusCode: 200
          })
        } else {
          reject({ errMsg: 'uploadFile fail: ' + xhr.responseText })
        }
      }
      // 请求失败
      xhr.onerror = e => {
        reject({ errMsg: 'uploadFile fail: ' + e.type })
      }
      xhr.send(createFormData(file, formData, name))

      setTimeout(() => {
        xhr.abort()
        reject({ errMsg: 'uploadFile fail: 请求超时' })
      }, timeout)
    })
    let progressFunc
    execFetch.progress = func => {
      progressFunc = func
      return execFetch
    }
    // 取消上传
    execFetch.abort = () => {
      xhr.abort()
      return execFetch
    }
    return execFetch
  }
})()

const upload = option => {
  let uploadTemp
  const promise = (option.files ? Promise.resolve(option.files) : getInputFile(option)).then(res => {
    return Promise
      .all(option.isImage ? res.map(file => imageAction(file, option)) : res.map(item => Promise.resolve(item)))
      .then(res => {
        uploadTemp = uploadTempFile(res, option)
          .start(() => callback.start?.())
          .progress(res => callback.progress?.(res))
        return uploadTemp
      })
  })
  const callback = {
    start: null,
    progress: null
  }
  promise.start = func => {
    callback.start = func
    return promise
  }
  promise.progress = func => {
    callback.progress = func
    return promise
  }
  promise.abort = () => uploadTemp.abort?.()
  return promise
}

const uploadTempFile = (files, option = {}) => {
  // 合成配置
  const { request: requestConfig, upload: uploadConfig, result: resultConfig } = option.config || {}
  // 使用驱动上传
  if (option.uploadType === 'drive' && uploadConfig.defaultDrive && option.drives[uploadConfig.defaultDrive]) {
    let startFunc
    let progressFunc
    const drive = option.drives[uploadConfig.defaultDrive]
    const uploadPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        const allSize = []
        let totalSize = 0
        let allProgressOld = 0
        startFunc?.()
        Promise.all(files.map((file, index) => {
          allSize.push(file.size)
          totalSize += file.size
          return drive.upload({
            file,
            progress: e => {
              allSize[index] = e.loaded
              const percent = allSize.reduce((prev, current) => prev + current) / totalSize
              if (percent - allProgressOld >= 0.05 || percent >= 0) {
                allProgressOld = percent
                progressFunc(percent)
              }
            }
          })
        }))
          .then(res => {
            if (option.getInfo) {
              resolve(res)
            } else {
              resolve(res.map(item => item.url))
            }
          })
          .catch(reject)
      }, 0)
    })
    // 开始通知
    uploadPromise.start = callback => {
      startFunc = callback
      return uploadPromise
    }
    // 进度通知
    uploadPromise.progress = callback => {
      progressFunc = callback
      return uploadPromise
    }
    return uploadPromise
  } else {
    // 使用本地上传

    // 进度通知
    const progress = (i, size) => {
      allSize[i][1] = size
      let allProgress = 0
      allSize.map(item => {
        allProgress += item[1] / item[0]
      })
      if (allProgress - allProgressOld > 0.1) {
        progressFunc?.(allProgress / allSize.length)
        allProgressOld = allProgress
      }
    }
    const allUpload = []
    const allSize = []
    let startFunc
    let progressFunc
    let allProgressOld = 0

    const uploadPromise = new Promise((resolve, reject) => {
      // 让这里的代码在后面执行
      setTimeout(async () => {
        let requestParams = {
          url: getUrl(option.api || uploadConfig.api, {}, option),
          timeout: option.timeout
        }

        requestParams.header = {
          ...execGetObject(requestConfig.header, requestParams),
          ...option.header
        }

        if (option.middle?.before?.length) {
          try {
            requestParams = await execMiddle(option.middle.before, requestParams, option)
          } catch (error) { /* empty */ }
        }
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          allSize.push([file.size || 0, 0])

          const params = {
            timeout: 600000,
            ...requestParams,
            file,
            name: option.requestField || uploadConfig.requestField
          }
          const uploadFileRes = uploadFile(params)
          uploadFileRes.progress(e => {
            progress(i, e.totalBytesSent)
          })
          if (option.middle?.result?.length) {
            allUpload.push(uploadFileRes)
          } else {
            allUpload.push(
              uploadFileRes.then(response => {
                try {
                  if (typeof response.data === 'string') {
                    response.data = JSON.parse(response.data)
                  }
                  const code = execGetChild(resultConfig.code, response)
                  const message = execGetChild(resultConfig.message, response)
                  if (code == resultConfig.succesCode) {
                    return execGetChild(option.resultField || uploadConfig.resultField, response)
                  } else {
                    throw { code, message }
                  }
                } catch (error) {
                  throw { message: '数据格式错误', code: resultConfig.errorCode, error, data: response.data }
                }
              })
            )
          }
        }
        if (allUpload.length === 0) {
          throw { message: '未选择图片', code: resultConfig.errorCode }
        }
        startFunc?.()
        Promise.all(allUpload)
          .then(async res => {
            if (option.middle.result?.length) {
              try {
                res = await execMiddle(option.middle.result, res, option)
                resolve(res)
              } catch (error) {
                reject(error)
              }
            } else {
              resolve(res)
            }
          })
          .catch(async err => {
            if (option.middle.error?.length) {
              try {
                err = await execMiddle(option.middle.error, err, option)
                resolve(err)
              } catch (error) {
                reject(error)
              }
            } else {
              reject(err)
            }
          })
      }, 0)
    })
    // 开始通知
    uploadPromise.start = callback => {
      startFunc = callback
      return uploadPromise
    }
    // 进度通知
    uploadPromise.progress = callback => {
      progressFunc = callback
      return uploadPromise
    }
    // 取消上传
    uploadPromise.abort = () => {
      for (let i = 0; i < allUpload.length; i++) {
        allUpload[i].abort()
      }
      return uploadPromise
    }
    return uploadPromise
  }

}

export const createUpload = (() => {
  const globalMiddle = {
    before: [],
    result: [],
    error: []
  }
  const remove = (arr, callback) => {
    return {
      remove: () => {
        const index = arr.indexOf(callback)
        ~index && arr.splice(index, 1)
      }
    }
  }

  return config => {
    const middle = {
      before: [],
      result: [],
      error: []
    }
    if (config?.middle) {
      Object.keys(config.middle).forEach(key => {
        middle[key].push(...config.middle[key])
      })
    }

    const on = (type, callback, common = false) => {
      const arr = common ? globalMiddle : middle
      arr[type].push(callback)
      return remove(arr, callback)
    }

    const getOption = option => {
      return {
        drives: { ...config.drives, ...option.drives },
        config: config?.config,
        middle: {
          before: [...globalMiddle.before, ...middle.before],
          result: [...globalMiddle.result, ...middle.result],
          error: [...globalMiddle.error, ...middle.error]
        },
        ...option
      }
    }

    return {
      upload: option => upload(getOption(option)),
      uploadTempFile: (files, option) => uploadTempFile(files, getOption(option)),
      middle: {
        before: (callback, common) => {
          return on('before', callback, common)
        },
        result: (callback, common) => {
          return on('result', callback, common)
        },
        error: (callback, common) => {
          return on('error', callback, common)
        }
      }
    }
  }
})()
