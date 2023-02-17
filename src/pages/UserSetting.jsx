import React, {useEffect, useState} from 'react'
import {Page, UploadImage, Table, request} from '../index'
import {
  Input,
  Form,
  Card,
  Tabs,
  Form as ArcoForm,
  Button, Message, Tag
} from '@arco-design/web-react'
const FormItem = Form.Item

export function UserSetting() {
  const [form] = ArcoForm.useForm()
  const [disabled, setDisabled] = useState(true)

  const url = 'personage'

  useEffect(() => {
    request({
      url: url,
      method: 'GET'
    })
      .then(res => {
        form.setFieldsValue(res)
        setDisabled(false)
      })
      .catch(res => {
        Message.error(res.message)
      })
  }, [form, url])

  return (
    <Page>
      <div className='flex flex-col lg:flex-row gap-4 items-stretch'>
        <div className='lg:w-120'>
          <Card title='个人资料' className='h-full'>
            <Form form={form} autoComplete='off' layout='vertical' disabled={disabled}>
              <FormItem noStyle>
              </FormItem>
              <FormItem label='头像' field='avatar' required>
                <UploadImage size={[20,20]} mode='aspectFill' width={120} height={120} />
              </FormItem>
              <FormItem label='用户名' field='username' required>
                <Input placeholder='用输入用户名' />
              </FormItem>
              <FormItem label='昵称' field='nickname' required>
                <Input placeholder='请输入昵称' />
              </FormItem>
              <FormItem label='密码' field='password'>
                <Input placeholder='不修改请留空' />
              </FormItem>
              <FormItem noStyle className='mb-0'>
                <Button type='primary' long disabled={disabled} onClick={() => {
                  form.validate().then(res => {
                    request({
                      url: url,
                      method: 'POST',
                      data: res,
                    })
                      .then(() => {
                        Message.success('资料保存成功')
                      })
                      .catch(res => {
                        Message.error(res.message)
                      })
                  })
                }}>保存</Button>
              </FormItem>
            </Form>


          </Card>

        </div>
        <div className='flex-grow w-1'>

          <Card className='h-full'>
            <Tabs defaultActiveTab='1' type='rounded'>
              <Tabs.TabPane key='1' title='登录日志'>
                <Table
                  url='personage/login'
                  columns={[
                    {
                      dataIndex: 'browser',
                      title: '浏览器',
                    },
                    {
                      dataIndex: 'platform',
                      title: '平台',
                    },
                    {
                      dataIndex: 'ip',
                      title: 'IP',
                    },
                    {
                      dataIndex: 'created_at',
                      title: '登录时间',
                    },
                    {
                      title: '状态',
                      render: (_, record) => (
                        record.status ? <Tag color='green' bordered>成功</Tag> : <Tag color='red' bordered>失败</Tag>
                      )
                    },
                  ]} />
              </Tabs.TabPane>
              <Tabs.TabPane key='2' title='操作日志'>
                <Table
                  url='personage/operate'
                  columns={[
                    {
                      dataIndex: 'request_url',
                      title: '请求',
                      render: (_, record) => (
                        <div className='flex flex-col gap-1'>
                          <div>{record.request_url}</div>
                          <div className='flex gap-2 flex-col md:flex-row'><Tag bordered color='orangered'>{record.route_title}</Tag>
                            <Tag bordered color='blue'>{record.request_method}</Tag> <Tag bordered
                              color='green'>{record.request_time}s</Tag>
                          </div>
                        </div>
                      )
                    },
                    {
                      dataIndex: 'client_ua',
                      title: '终端',
                      render: (_, record) => (
                        <div className='flex flex-col gap-1'>
                          <div>{record.client_browser}</div>
                          <div className='flex gap-2 flex-col md:flex-row'><Tag bordered color='blue'>{record.client_device}</Tag>
                            <Tag bordered color='green'>{record.client_ip}</Tag>
                          </div>
                        </div>
                      )
                    },

                    {
                      dataIndex: 'time',
                      title: '时间',
                      width: 200,
                    },
                  ]} />
              </Tabs.TabPane>
            </Tabs>
          </Card>

        </div>
      </div>
    </Page>
  )
}
