import { useEffect, useState } from 'react'
import { ObjectManage } from './data'
import { QuickEvent } from './QuickEvent'

class SystemInfo extends ObjectManage {
  static widthSizeEmit = {
    sm: 0,
    md: 1,
    lg: 2,
    xl: 3,
    xxl: 4,
    getType: value => {
      return Object.keys(this.widthSizeEmit).find(key => this.widthSizeEmit[key] === value)
    }
  }

  /**
   * 获取尺寸的方法
   * @param {*} width
   * @returns
   */
  static getWidthSize = width => {
    if (width < 640) {
      return [this.widthSizeEmit.sm, this.widthSizeEmit]
    } else if (width < 768) {
      return [this.widthSizeEmit.md, this.widthSizeEmit]
    } else if (width < 1024) {
      return [this.widthSizeEmit.lg, this.widthSizeEmit]
    } else if (width < 1280) {
      return [this.widthSizeEmit.xl, this.widthSizeEmit]
    } else {
      return [this.widthSizeEmit.xxl, this.widthSizeEmit]
    }
  }

  constructor(props) {
    super(props)
    this.init()
  }

  data = {
    OSType: 'pc',
    windowWidth: document.body.clientWidth,
    windowHeight: document.body.clientWidth
  }

  changeEvent = new QuickEvent()

  onChange = this.changeEvent.on

  init = () => {
    const getOSType = () => {
      const os = (function () {
        const ua = navigator.userAgent,
          isWindowsPhone = /(?:Windows Phone)/.test(ua),
          isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
          isAndroid = /(?:Android)/.test(ua),
          isFireFox = /(?:Firefox)/.test(ua),
          isChrome = /(?:Chrome|CriOS)/.test(ua),
          isTablet =
            /(?:iPad|PlayBook)/.test(ua) ||
            (isAndroid && !/(?:Mobile)/.test(ua)) ||
            (isFireFox && /(?:Tablet)/.test(ua)),
          isPhone = /(?:iPhone)/.test(ua) && !isTablet,
          isPc = !isPhone && !isAndroid && !isSymbian
        return {
          isTablet: isTablet,
          isPhone: isPhone,
          isAndroid: isAndroid,
          isPc: isPc
        }
      })()
      if (os.isAndroid || os.isPhone) {
        this.data.OSType = 'phone'
      } else if (os.isTablet) {
        this.data.OSType = 'tablet'
      } else if (os.isPc) {
        this.data.OSType = 'pc'
      }
    }
    getOSType()
    window.addEventListener('resize', () => {
      this.data.windowWidth = document.body.clientWidth
      this.data.windowHeight = document.body.clientWidth
      getOSType()
      this.data = { ...this.data }
      this.changeEvent.trigger(this.data)
    })
  }
}

export const systemInfo = new SystemInfo({})

export const useSystemInfo = () => {
  const [data, setData] = useState(systemInfo.data)

  useEffect(() => {
    const { remove } = systemInfo.onChange(setData)
    return () => remove()
  }, [])

  return data
}

export const useDocSize = () => {
  const { windowWidth } = useSystemInfo()

  const [data, setData] = useState(SystemInfo.getWidthSize(systemInfo.data.windowWidth))

  useEffect(() => {
    setData(old => {
      const size = SystemInfo.getWidthSize(windowWidth)
      if (size[0] === old[0]) {
        return old
      }
      return size
    })
  }, [windowWidth])

  return data
}
