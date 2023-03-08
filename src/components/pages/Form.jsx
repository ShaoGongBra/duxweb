import React, { useState, useEffect, useRef } from 'react'
import { Button, Form as ArcoForm, Message } from '@arco-design/web-react'
import { useDocSize, request, route } from '../../utils'
import { Page } from './index';
import Header from './Header';


export function ModalForm({ url, infoUrl, infoSet = true, layout, onSubmit, className, children }) {
  const [size, sizeType] = useDocSize()
  const [form] = ArcoForm.useForm()
  const [disabled, setDisabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({})

  useEffect(() => {
    if (infoUrl === false) {
      setDisabled(false)
      return
    }
    request({
      url: infoUrl || url,
      method: 'GET'
    })
      .then(res => {
        if (infoSet) {
          form.setFieldsValue(res?.info)
        }
        setDisabled(false)
        setData(res)
      })
      .catch(res => {
        Message.error(res.message)
      })
  }, [form, infoUrl, url])

  return (

    <div className={`${className || 'w-xl'}  max-w-full`}>
      <div className='p-4 pb-0'>
        <ArcoForm
          disabled={disabled}
          form={form}
          autoComplete='off'
          layout={layout ? layout : size > sizeType.lg ? 'horizontal' : 'vertical'}
          validateMessages={{
            required: (_, { label }) => `必须输入${label}`,
          }}
        >
          {typeof children === 'function' ? children({ data, form }) : children}
        </ArcoForm>
      </div>
      <div className='arco-modal-footer'>
        <Button
          onClick={() => {
            route.closeModal(false)
          }}
        >
          取消
        </Button>
        <Button
          type='primary'
          disabled={disabled}
          loading={loading}
          onClick={() => {
            form.validate().then(res => {
              setLoading(true)
              request({
                url: url,
                method: 'POST',
                data: res,
                middle: {
                  result: [
                    async res => {
                      if (res.statusCode === 200) {
                        // console.log(res)
                        Message.success(res.data.message)
                      }
                      return res
                    }
                  ]
                }
              })
                .then(res => {
                  onSubmit?.(res)
                  setLoading(false)
                  route.closeModal(true)
                })
                .catch(res => {
                  Message.error(res.message)
                  if (res.code === 422) {
                    let $fields = {};
                    for (let field in res.data) {
                      $fields[field] = {
                        error: {
                          message: res.data[field].join(',')
                        }
                      }
                    }
                    form.setFields($fields)
                    setLoading(false)
                  }
                })
            })
          }}
        >
          提交
        </Button>
      </div>
    </div>
  )
}


export function PageForm({ url, infoUrl, onSubmit, title, children }) {
  const [form] = ArcoForm.useForm()
  const [disabled, setDisabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({})

  const defaultValue = useRef({})

  useEffect(() => {
    if (infoUrl === false) {
      setDisabled(false)
      return
    }
    request({
      url: infoUrl || url,
      method: 'GET'
    })
      .then(res => {
        defaultValue.current = res?.info || {}
        form.setFieldsValue(res?.info)
        setDisabled(false)
        setData(res)
      })
      .catch(res => {
        Message.error(res.message)
      })
  }, [form, infoUrl, url])

  return (
    <Page

      header={
        <Header
          title={title}
          menus={
            <>
              <Button
                onClick={() => form.setFieldsValue(defaultValue.current)}
              >
                重置
              </Button>
              <Button
                type='primary'
                disabled={disabled}
                loading={loading}
                onClick={() => {
                  form.validate().then(res => {
                    setLoading(true)
                    request({
                      url: url,
                      method: 'POST',
                      data: res,
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
                      .then(res => {
                        onSubmit?.(res)
                        setLoading(false)
                        route.closeModal(true)
                      })
                      .catch(res => {
                        Message.error(res.message)
                        if (res.code === 422) {
                          let $fields = {};
                          for (let field in res.data) {
                            $fields[field] = {
                              error: {
                                message: res.data[field].join(',')
                              }
                            }
                          }
                          form.setFields($fields);
                        }
                      }).finally(() => {
                      setLoading(false)
                    })
                  })
                }}
              >
                提交
              </Button>
            </>
          }
        />
      }
    >
      <div className='rounded shadow-sm bg-color-1 p-4'>
        <ArcoForm
          disabled={disabled}
          form={form}
          autoComplete='off'
          layout={'vertical'}
          validateMessages={{
            required: (_, { label }) => `必须输入${label}`,
          }}
        >
          {typeof children === 'function' ? children({ data, form }) : children}
        </ArcoForm>
      </div>
    </Page>
  )
}



export function PageFormLayout({ children, className }) {
  return (<div className={`flex flex-col gap-3 ${className}`}>
    {children}
  </div>)
}


export function PageFormItem(config) {
  let label = config.label
  return (<div className='grid lg:grid-cols-3 gap-4 pt-6 border-t border-color-2'>
    <div className='col-span-1 flex flex-col gap-1'>
      <div className=''>{label}</div>
      <div className='text-color-3'>{config.desc}</div>
    </div>
    <div className='col-span-2'>
      <ArcoForm.Item {...config} label='' className='w-full'>
        {config.children}
      </ArcoForm.Item>
    </div>
  </div>)
}

PageForm.Layout = PageFormLayout
PageForm.Item = PageFormItem