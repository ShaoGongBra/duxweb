import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Select as ArcoSelect, Message, Spin, Avatar } from '@arco-design/web-react'
import { request } from '../../utils'


function formatData(list, fieldNames) {
  return list?.map(item => {
    let label = fieldNames?.label
    if (typeof label === 'function') {
      label = label(item)
    } else {
      label = item[fieldNames?.label || 'label']
    }
    return {
      value: item[fieldNames?.value || 'value'],
      label: label,
    }
  })
}

export function UrlSelect(config) {
  const [options, setOptions] = useState([])
  useEffect(() => {
    request({
      url: config.url,
      method: 'GET'
    })
      .then(res => {
        let data = formatData(res?.list, config?.fieldNames)
        setOptions(data)
      })
      .catch(res => {
        Message.error(res.message)
      })
  }, [config.url])

  return (
    <ArcoSelect {...config} allowClear options={options} className='min-w-45'>
    </ArcoSelect>
  )
}


export function UrlSearchSelect(config) {
  const [options, setOptions] = useState([])
  const [fetching, setFetching] = useState(false)
  const getData = useCallback((inputValue, _, data) => {
    request({
      url: config.url,
      method: 'GET',
      data: {
        keyword: inputValue,
        ...data
      }
    })
      .then(res => {
        let data = formatData(res?.list, config?.fieldNames)
        setFetching(false)
        setOptions(data)
      })
      .catch(res => {
        Message.error(res.message)
      })
  }, [])

  useEffect(() => {
    setTimeout(() => {
      // 等待编辑模式判断之后再获取默认列表
      if (!currentValue.current.edit) {
        getData()
      }
    }, 600)
  }, [getData])

  useEffect(() => {
    setOptions(formatData(config.options, config?.fieldNames))
  }, [config.options])

  const clear = useCallback(() => {
    getData()
  }, [])

  const currentValue = useRef({
    edit: false,
    value: null
  })
  const change = useCallback(value => {
    currentValue.current.value = value
    config.onChange?.(value)
  }, [config.onChange])

  useEffect(() => {
    // 判断是不是编辑模式 编辑模式第一次获取数据
    if (config.value && config.value !== currentValue.current.value) {
      currentValue.current.value = config.value
      currentValue.current.edit = true
      getData('', null, { [config.valueField || 'key']: config.value })
    }
  }, [config.value])

  return (
    <ArcoSelect
      {...config}
      onClear={clear}
      onChange={change}
      allowClear
      showSearch
      filterOption={false}
      className='min-w-45'
      options={options}
      onSearch={getData}
      notFoundContent={
        fetching ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Spin style={{ margin: 12 }} />
          </div>
        ) : null
      }

    />
  )
}
