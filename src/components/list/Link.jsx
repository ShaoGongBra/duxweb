import React from 'react'
import { Button, Message, Popconfirm } from '@arco-design/web-react'
import { Permission, request, route } from '../../index';

export const LinkPage = ({
  key,
  permission,
  url,
  params,
  name,
  button,
}) => {
  return (
    <Permission mark={permission} key={key}>
      <Button
        {...button}
        onClick={() => {
          route.push(
            url,
            params
          )
        }}
      >
        {name}
      </Button>
    </Permission>
  )
}

export const LinkModal = ({
  key,
  permission,
  url,
  params,
  name,
  title,
  config,
  table,
  button,
  onModal
}) => {
  return (
    <Permission mark={permission} key={key}>
      <Button
        {...button}
        onClick={async () => {
          const status = await route
            .modal(
              url,
              params,
              {
                title,
                ...config
              }
            )
            .getData()
          if (status) {
            table?.current?.reload()
            onModal?.()
          }
        }}
      >
        {name}
      </Button>
    </Permission>
  )
}

export function LinkConfirm(
  {
    permission,
    url,
    params,
    method = 'DELETE',
    title,
    table,
    name,
    button,
    onConfirm
  }
) {
  return (<Permission mark={permission}>
    <Popconfirm
      position='br'
      focusLock
      title={title}
      onOk={() => {
        request({
          url: url,
          method: method,
          data: params,
          middle: {
            result: [
              async res => {
                if (res.statusCode === 200) {
                  Message.success(res.data.message)
                }
                return res
              }
            ]
          }
        })
          .then(() => {
            table?.current?.reload()
            onConfirm?.()
          })
          .catch(res => {
            Message.error(res.message)
          })
      }}
    >
      <Button  {...button}>
        {name}
      </Button>
    </Popconfirm>
  </Permission>)
}
