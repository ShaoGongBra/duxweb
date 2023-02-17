import { useMemo, useState, useCallback, useEffect, useRef } from 'react'

export const createRequestHooks = request => {
  return {
    useRequest: (option, config) => {
      const _config = useRef(config || {})

      const defaultData = useMemo(() => _config.current?.defaultData || {}, [])

      const [data, setData] = useState(defaultData)

      const [status, setStatus] = useState(true)

      // 更新配置
      useEffect(() => {
        _config.current = { ..._config.current, ...config }
      }, [config])

      const resultAction = useCallback(async res => {
        if (_config.current?.detailCallback) {
          res = _config.current.detailCallback(res)
          if (res instanceof Promise) {
            res = await res
          }
        }
        if (_config.current?.field) {
          setData(res[_config.current.field])
        } else {
          setData(res)
        }
      }, [])

      const reload = useCallback(() => {
        if (!option || _config.current.status) {
          return
        }
        setStatus(true)
        _config.current.status = true
        request(option)
          .then(resultAction)
          .catch(err => {
            if (_config.current?.onError) {
              return _config.current?.onError(err)
            }
            throw err
          })
          .finally(() => {
            _config.current.status = false
            setStatus(false)
          })
      }, [option, resultAction])

      useEffect(() => {
        reload()
      }, [reload])

      const result = useMemo(
        () => [
          data,
          {
            status,
            reload,
            set: setData
          }
        ],
        [data, reload, status]
      )

      return result
    }
  }
}
