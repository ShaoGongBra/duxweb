import { useEffect, useMemo, useState } from 'react'
import { ObjectManage } from './data'
import { System, useSystem } from './system'

class GlobalConfig extends ObjectManage {
  constructor(props) {
    super(props)
  }

  data = {
    __global__: {
      duxweb: {
        // 高德地图设置
        map: {
          key: '42e2f98b596c7b448c2acdab7432bb73',
          apiKey: '953af0a1e1ec19a44dd283eee79c139b'
        },
        // 上传配置
        upload: {
          // 水印
          logo: ''
        }
      }
    }
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

  useGlobalConfig = callback => {

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
  
    return [data]
  }
}

export const globalConfig = new GlobalConfig({
  cache: true,
  cacheKey: 'global-config'
})