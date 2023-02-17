import React, { useEffect, useState } from 'react'
import { Cascader, Message } from '@arco-design/web-react'
import { request } from '../../utils'

export function UrlCascader(config) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    request({
      url: config.url,
      method: 'GET'
    })
      .then(res => {
        setOptions(res?.list)
        setLoading(false)
      })
      .catch(res => {
        Message.error(res.message)
      })
  }, [config.url])

  return <Cascader loading={loading} options={options} {...config} />
}
