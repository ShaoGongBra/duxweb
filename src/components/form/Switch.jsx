import React from 'react'
import { Switch, Message } from '@arco-design/web-react'
import { request } from '../../utils'

export function UrlSwitch(config) {
  return (
    <Switch {...config} onChange={value => {
      request({
        url: config.url,
        method: 'POST',
        data: {key: config.field, value: value}
      }).catch(res => {
        Message.error(res.message)
      })
    }} />
  )
}
