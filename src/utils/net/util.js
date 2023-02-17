import * as qs from 'qs'
import { recursionGetValue } from '../object'

/**
 * 获取请求url
 * @param {string} url api
 * @param {object} data 要加在url上的get参数
 * @param {object} params 请求参数
 * @return {string} 完整请求url
 */
const getUrl = (url, data = {}, params = {}) => {
  const { request } = params.config

  if (url.indexOf('http://') === -1 && url.indexOf('https://') === -1) {
    let urls = []
    urls.push(request.origin)

    request.path && urls.push(request.path)
    urls.push(url)
    url = urls.join('/')
  }
  // 拼接url参数
  const getParams = qs.stringify(data)
  if (getParams) {
    url += url.indexOf('?') === -1 ? '?' : '&'
    url += getParams
  }
  return url
}

/**
 * 获取对象 如果这是个函数，获取函数的返回值
 * @param {*} data
 * @returns
 */
const execGetObject = (obj, ...params) => (typeof obj === 'function' ? obj(...params) : obj)

/**
 * 获取结果
 * @param {*} index
 * @param {*} res
 * @returns
 */
const execGetChild = (index, res, ...params) =>
  typeof index === 'function' ? index(res, ...params) : recursionGetValue(index, res)

/**
 * 数据处理函数
 * @param {*} callback 处理函数列表
 * @param {*} result 要处理的数据
 * @returns
 */
const execMiddle = async (callbacks, result, params) => {
  for (let i = 0; i < callbacks.length; i++) {
    result = callbacks[i](result, params)
    if (result instanceof Promise) {
      result = await result
    }
  }
  return result
}

/**
 *选择文件
 * @param {*} param1
 * @returns
 */
const getInputFile = (() => {
  let input
  return ({
    // 多选
    multiple,
    // 选择来源 user 前置摄像头 environment 后置摄像头 为空则使用默认
    capture,
    // 选择文件的类型
    accept
  } = {}) => {
    if (!input) {
      input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('style', 'position: fixed; top: -4000px; left: -3000px; z-index: -300;')
      document.body.appendChild(input)
    }
    if (multiple) {
      input.setAttribute('multiple', true)
    } else {
      input.removeAttribute('multiple')
    }
    if (capture) {
      input.setAttribute('capture', capture)
    } else {
      input.removeAttribute('capture')
    }
    if (accept) {
      input.setAttribute('accept', accept)
    } else {
      input.removeAttribute('accept')
    }

    return new Promise(resolve => {
      const MouseEvents = document.createEvent('MouseEvents')
      MouseEvents.initEvent('click', true, true)
      input.dispatchEvent(MouseEvents)
      input.onchange = ({ target }) => {
        if (target) {
          const files = [...target.files || []]
          target.value = ''
          resolve(files)
        }
      }
    })
  }
})()

export { getUrl, execGetObject, execGetChild, execMiddle, getInputFile }
