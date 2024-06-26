import * as qs from 'qs'
import { getUrl, execGetObject, execGetChild, execMiddle } from './util'
import { asyncTimeOut } from '../util'

const requestReact = async ({ url, data, header, timeout, onController, ...option } = {}) => {
  if (option.method === 'POST') {
    option.body = data
  }
  option.headers = header

  // 用户终止请求
  const controller = new AbortController()
  option.signal = controller.signal

  onController(controller)

  const race = [
    fetch(url, option)
  ]
  timeout && race.push(asyncTimeOut(timeout));
  const res = await Promise.race(race)
  if (timeout && res.type === 'timeout') {
    // 终止请求
    controller.abort()
    throw { statusCode: 500, errMsg: '请求超时' }
  }
  // 清除定时器
  timeout && race[1].clear()
  // 文件下载
  const fileNameEncode = res.headers.get('content-disposition')?.split?.('filename=')[1]
  if (fileNameEncode) {
    const fileName = decodeURIComponent(fileNameEncode)
    const blob = await res.blob()
    const reader = new FileReader()
    reader.readAsDataURL(blob)    // 转换为base64，可以直接放入a表情href
    reader.onload = e => {
      // 转换完成，创建一个a标签用于下载
      const a = document.createElement('a')
      a.download = fileName
      a.href = e.target.result
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
    return {
      statusCode: res.status,
      errMsg: res.statusText,
      data: {
        message: '导出成功'
      },
      header: {}
    }
  }
  const contentType = res.headers.get('Content-Type')?.toLowerCase() || ''
  const isJson = contentType.indexOf('application/json') === 0
  const headersValues = [...res.headers.values()]
  const result = {
    statusCode: res.status,
    errMsg: res.statusText,
    data: null,
    header: Object.fromEntries([...res.headers.keys()].map((key, index) => [key, headersValues[index]]))
  }
  if (isJson) {
    result.data = await res.json()
  } else {
    result.data = await res.text()
  }
  return result
}

const request = (() => {
  const requestKeys = {}
  return params => {
    const { request: requestConfig = {}, result: resultConfig = {} } = params.config || {}

    // 处理请求方式
    params.method = params.method?.toUpperCase() || 'GET'

    // 请求数据
    params.data = { ...execGetObject(requestConfig.data, params), ...(params.data || {}) }

    // 请求地址
    params.url = getUrl(
      params.url,
      { ...execGetObject(requestConfig.getData, params), ...(params.method === 'GET' ? params.data || {} : {}) },
      params
    )

    const {
      url,
      header = {},
      data = {},
      method = 'GET',
      timeout = 30000,
      repeatTime = 500,
      toast: toastError,
      loading
    } = params

    // 防止过快的重复请求
    // if (repeatTime) {
    //   const requestKey = url + '-' + qs.stringify(data) + '-' + method
    //   const now = Date.now()
    //   const last = requestKeys[requestKey]
    //   if (!last || now - last > repeatTime) {
    //     requestKeys[requestKey] = now
    //   } else {
    //     return Promise.reject({ code: 3, message: '重复请求', requestKey })
    //   }
    // }

    if (!requestConfig.contentType) {
      requestConfig.contentType = 'application/json'
    }
    let requestParams = {
      url,
      data:
        method === 'POST'
          ? requestConfig.contentType.indexOf('application/json') !== -1
            ? JSON.stringify(data)
            : qs.stringify(data)
          : {},
      header: {
        ...execGetObject(requestConfig.header, params),
        'Content-Type': requestConfig.contentType,
        ...header
      },
      method,
      timeout
    }

    // 请求中间件
    const middle = params.middle || {}

    let controller
    // eslint-disable-next-line no-async-promise-executor
    const requestTask = new Promise(async (resolve, reject) => {
      if (middle.before?.length) {
        try {
          requestParams = await execMiddle(middle.before, requestParams, params)
        } catch (error) {
          reject(error)
        }
      }
      const taroRequestTask = requestReact({ ...requestParams, onController: _controller => controller = _controller })
      if (!url) {
        reject({ message: '请求URL错误', code: resultConfig.errorCode })
      }
      if (middle.result?.length) {
        // 中间件处理返回数据
        try {
          let result = await taroRequestTask
          result = await execMiddle(middle.result, result, params)
          resolve(result)
        } catch (error) {
          if (error?.statusCode) {
            reject({ message: error.errMsg, code: error.statusCode })
          } else {
            reject({ message: error.message, code: error.code })
          }
        }
      } else {
        // 配置处理返回数据
        taroRequestTask
          .then(async res => {
            try {
              const code = execGetChild(resultConfig.code, res)
              const message = execGetChild(resultConfig.message, res)
              if (code == resultConfig.succesCode) {
                resolve(execGetChild(resultConfig.data, res))
              } else {
                reject({ code, message })
              }
            } catch (error) {
              reject({ message: '数据格式错误', code: resultConfig.errorCode })
            }
          })
          .catch(err => {
            const code = execGetChild(resultConfig.code, err)
            const message = execGetChild(resultConfig.message, err)
            reject({ message, code })
          })
      }
    })
      .then(res => {
        // loading && loadingClose?.() || Taro.hideLoading()
        return res
      })
      .catch(async err => {
        // loading && loadingClose?.() || Taro.hideLoading()
        if (middle.error?.length) {
          return await execMiddle(middle.error, err, params)
        }
        throw err
      })
      .catch(err => {
        // toastError && toast(err.message || JSON.stringify(err))
        err.url = url
        throw err
      })
    requestTask.abort = () => controller?.abort?.()
    return requestTask
  }
})()

const searchQuickMarks = {}
const throttleRequest = (params, mark = '') => {
  const key = params.url + mark
  if (searchQuickMarks[key] === undefined) {
    searchQuickMarks[key] = {
      timer: null,
      prevReject: null,
      requestTask: null
    }
  }
  const item = searchQuickMarks[key]
  return new Promise((resolve, reject) => {
    if (item.timer) {
      clearTimeout(item.timer)
      item.prevReject({ message: '过快请求', code: 1 })
    }
    if (item.requestTask) {
      item.requestTask.abort()
      item.requestTask = null
      item.prevReject({ message: '请求被覆盖', code: 2 })
    }
    item.prevReject = reject
    item.timer = setTimeout(() => {
      item.timer = null
      item.requestTask = request(params)
        .then(res => {
          item.requestTask = null
          resolve(res)
        })
        .catch(err => {
          item.requestTask = null
          reject(err)
        })
    }, 200)
  })
}

export const createRequest = (() => {
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
  const setConfig = (data, setData) => {
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        const element = data[key]
        if (
          !setData[key] ||
          typeof setData[key] !== 'object' ||
          Array.isArray(setData[key]) ||
          typeof element === 'function'
        ) {
          setData[key] = element
        } else {
          setConfig(element, setData[key])
        }
      }
    }
  }
  return (config = {}) => {
    if (!config.config) {
      config.config = {}
    }
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
    const on = (type, callback, common = false, before = false) => {
      const arr = common ? globalMiddle : middle
      if (before) {
        arr[type].unshift(callback)
      } else {
        arr[type].push(callback)
      }
      return remove(arr, callback)
    }
    const getParams = params => {
      params = typeof params === 'string' ? { url: params } : params
      return {
        config: config?.config,
        ...params,
        middle: {
          before: [...(params.middle?.before || []), ...globalMiddle.before, ...middle.before],
          result: [...(params.middle?.result || []), ...globalMiddle.result, ...middle.result],
          error: [...(params.middle?.error || []), ...globalMiddle.error, ...middle.error]
        }
      }
    }

    return {
      request: params => request(getParams(params)),
      throttleRequest: params => throttleRequest(getParams(params)),
      middle: {
        before: (callback, common, before) => {
          return on('before', callback, common, before)
        },
        result: (callback, common, before) => {
          return on('result', callback, common, before)
        },
        error: (callback, common, before) => {
          return on('error', callback, common, before)
        }
      },
      config: (data = {}) => setConfig(data, config.config)
    }
  }
})()
