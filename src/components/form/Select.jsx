import React, {useCallback, useEffect, useState} from 'react'
import {Select as ArcoSelect, Message, Spin, Avatar} from '@arco-design/web-react'
import {request} from '../../utils'


function formatData(list, fieldNames) {
  return list?.map(item => {
    let label = fieldNames?.label
    if (typeof label === 'function') {
      label = label(item)
    }else {
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
  const [options, setOptions] = useState()
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
    setOptions(formatData(config.options, config?.fieldNames))
  }, [config.options])

  return (
    <ArcoSelect
      {...config}
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
            <Spin style={{margin: 12}}/>
          </div>
        ) : null
      }

    />
  )
}
