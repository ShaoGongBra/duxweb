import { useEffect, useMemo, useState } from 'react'
import { ObjectManage } from './data'
import { System, useSystem } from './system'
// 从项目里面同步获取配置文件 以防读取配置的时候无法获取
import config from '../../../../client/config.json'

class GlobalConfig extends ObjectManage {
  constructor(props) {
    super({})
  }

  data = {
    __global__: {
      duxweb: {
        // 高德地图设置
        map: {
          key: '',
          apiKey: ''
        },
        // 上传配置
        upload: {
          // 水印
          logo: ''
        }
      }
    },
    [System.current]: config
  }

  getConfig = callback => {
    const _data = { ...this.data.__global__, ...this.data[System.current] }
    return callback ? callback(_data) : _data
  }

  setConfig = data => {
    if (typeof data === 'function') {
      data = data(this.data[System.current] || {})
    }
    this.set({
      ...this.data,
      [System.current]: {
        ...this.data[System.current],
        ...data
      }
    })
  }

  useConfig = callback => {

    const system = useSystem()

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const defaultData = useMemo(() => globalConfig.getConfig(callback), [])

    const [data, setData] = useState(defaultData)

    useEffect(() => {
      const getData = () => setData(globalConfig.getConfig(callback))
      getData()
      const { remove } = globalConfig.onSet(getData)
      return () => remove()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [system])

    return data
  }
}

export const globalConfig = new GlobalConfig()