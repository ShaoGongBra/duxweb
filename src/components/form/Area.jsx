import React, {useEffect, useState} from 'react'
import {Cascader} from '@arco-design/web-react'
import {request} from '../../utils'

export function Area(config) {
  const [options, setOptions] = useState([]);
  const loadMore = (pathValue, level) => new Promise((resolve) => {
    request({
      url: config.url, data: {
        level: level, parent: pathValue === 0 ? '' : pathValue?.slice(-1)[0]
      }, method: 'get'
    }).then(res => {
      const nodes = res.list.map(item => ({
        label: item.name, value: item.name, isLeaf: (level >= (config?.level || 2)) || item.leaf,
      }))
      resolve(nodes)
    })
  });
  useEffect(() => {
    loadMore(0, 0).then(r => {
      setOptions(r)
    })
  }, [])

  return <Cascader
    options={options}
    loadMore={loadMore}
    showSearch
    allowClear {...config} />
}
