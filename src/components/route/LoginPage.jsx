import { Button, Form, Input } from '@arco-design/web-react'
import { IconLock, IconDesktop } from '@arco-design/web-react/icon'
import React, { useCallback, useState } from 'react'
import { request } from '../../utils'
import loginBg from '../../static/login.png'

const FormItem = Form.Item

export const Login = ({
  onLogin,
  title = '账号登录',
  desc = '欢迎使用 DUX 管理系统'
}) => {
  const [form, setForm] = useState({
    username: '',
    password: ''
  })

  const [loginStatus, setLoginStatus] = useState('validating')
  const [loginMessage, setLoginMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const login = useCallback(() => {
    setLoginStatus('validating')
    setLoading(true)
    request({
      url: 'login',
      method: 'POST',
      data: form
    })
      .then(res => {
        onLogin?.(res)
      })
      .catch(res => {
        setLoginMessage(res.message)
        setLoginStatus('error')
        setTimeout(() => {
          setLoading(false)
        }, 500)
      })
  }, [form, onLogin])

  return (
    <div
      className='h-screen z-10 flex  md:items-center justify-center bg-no-repeat bg-center bg-cover bg-primary-7 '
      style={{
        backgroundImage: `url(${loginBg})`
      }}>
      <div className='flex h-screen md:h-auto flex-col flex-col bg-color-1 text-color-1 max-w-full w-full md:w-130 md:rounded shadow'>
        <div className=' bg-primary-7 bg-cover  flex flex-col justify-center p-4 py-8 md:rounded-t'
          style={{
            backgroundImage: `url(${loginBg})`
          }}
        >
          <div className='text-center'>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 202.97 197.7' className='w-16 fill-white'>
              <path
                d='M170,94.52l-35.9-20.73-24.34,14,11.62,6.71a5,5,0,0,1,0,8.66L32.5,154.52a5,5,0,0,1-7.5-4.33V99.61a6.44,6.44,0,0,1,0-1.52V47.51a5,5,0,0,1,7.5-4.33l35,20.23,24.32-14L7.5.68A5,5,0,0,0,0,5V192.69A5,5,0,0,0,7.5,197L170,103.18A5,5,0,0,0,170,94.52Z' />
              <path
                d='M32.93,103.18l35.9,20.73,24.34-14-11.62-6.71a5,5,0,0,1,0-8.66l88.92-51.34a5,5,0,0,1,7.5,4.33V98.09a6.44,6.44,0,0,1,0,1.52v50.58a5,5,0,0,1-7.5,4.33l-35-20.23-24.32,14L195.47,197a5,5,0,0,0,7.5-4.33V5a5,5,0,0,0-7.5-4.33L32.93,94.52A5,5,0,0,0,32.93,103.18Z' />
            </svg>
          </div>
          <div className='text-center text-lg mt-2  text-white'>{title}</div>
          <div className='text-center text-secondary mt-2 text-sm   text-white text-opacity-20'>{desc}</div>
        </div>
        <div className='p-6'>
          <Form onSubmit={login} autoComplete='off' layout='vertical'>
            <FormItem name='username' validateStatus={loginStatus}>
              <Input
                onChange={e => setForm(old => ({ ...old, username: e }))}
                prefix={<IconDesktop />}
                placeholder='请输入账户名'
                size='large'
              />
            </FormItem>
            <FormItem name='password' validateStatus={loginStatus}>
              <Input
                type='password'
                onChange={e => setForm(old => ({ ...old, password: e }))}
                prefix={<IconLock />}
                placeholder='请输入密码'
                autoComplete='new-password'
                size='large'
              />
            </FormItem>
            <FormItem className="mb-0">
              <div>{loginStatus == 'error' ? <div className='text-danger'>{loginMessage}</div> : ''}</div>
              <div className='mt-3 w-full'>
                <Button type='primary' htmlType='submit' size='large' long loading={loading}>
                  登录
                </Button>
              </div>
            </FormItem>
          </Form>
        </div>
      </div>
    </div>
  )
}
