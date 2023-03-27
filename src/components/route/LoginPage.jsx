import { Button, Form, Input } from '@arco-design/web-react'
import { IconLock, IconDesktop } from '@arco-design/web-react/icon'
import React, {useCallback, useEffect, useState} from 'react'
import { request } from '../../utils'
import loginBg from '../../static/login.png'
import vaptcha from '@chongying-star/vaptcha-typescript'

const FormItem = Form.Item

export const Login = ({
                        onLogin,
                        title = '账号登录',
                        desc = '欢迎使用 DUX 管理系统',
                        copyright = 'Copyright © 2023 DuxWeb',
                        side = {
                          title: '帮助您的企业快速增长业务',
                          desc: '为您打造量身打造的快捷、高效、安全的后台管理系统'
                        }
                      }) => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    vaptcha: {
      server: '',
      token: ''
    }
  })

  const [loginStatus, setLoginStatus] = useState('validating')
  const [loginMessage, setLoginMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(true)



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

  useEffect(() => {
    console.log(document.querySelector('#VAPTCHAContainer'))
    vaptcha({
      vid: '',
      container: '#VAPTCHAContainer',
      mode: 'click',
      area: 'auto',
      scene: 0,
    }).then((obj) => {
      obj.render();
      obj.listen('pass', function () {
        let serverToken = obj.getServerToken();
        setDisabled(false)
        setForm({...form, ...{
            vaptcha: {
              server: serverToken.server,
              token: serverToken.token,
            }
          }})
      })


    });
  }, [])

  return (
    <div
      className='h-screen z-10 flex  md:items-center justify-center bg-gray-3 '>
      <div className='grid grid-cols-1 md:grid-cols-2 bg-color-1 text-color-1 max-w-full w-full md:w-230 md:rounded shadow-lg md:m-10'>
        <div className=' bg-primary-7 bg-cover hidden md:flex flex-col   justify-center p-10 md:rounded-l '
             style={{
               backgroundImage: `url(${loginBg})`
             }}
        >

          <div className='text-2xl text-white'>{side.title}</div>
          <div className='text-white opacity-70 mt-6'>{side.desc}</div>

        </div>
        <div className='flex items-center justify-center p-6 md:p-20'>
          <Form onSubmit={login} autoComplete='off' layout='vertical'>

            <div className='py-4 md:py-6'>
              <div className='text-center'>
                <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 202.97 197.7' className='w-16 fill-primary'>
                  <path
                    d='M170,94.52l-35.9-20.73-24.34,14,11.62,6.71a5,5,0,0,1,0,8.66L32.5,154.52a5,5,0,0,1-7.5-4.33V99.61a6.44,6.44,0,0,1,0-1.52V47.51a5,5,0,0,1,7.5-4.33l35,20.23,24.32-14L7.5.68A5,5,0,0,0,0,5V192.69A5,5,0,0,0,7.5,197L170,103.18A5,5,0,0,0,170,94.52Z' />
                  <path
                    d='M32.93,103.18l35.9,20.73,24.34-14-11.62-6.71a5,5,0,0,1,0-8.66l88.92-51.34a5,5,0,0,1,7.5,4.33V98.09a6.44,6.44,0,0,1,0,1.52v50.58a5,5,0,0,1-7.5,4.33l-35-20.23-24.32,14L195.47,197a5,5,0,0,0,7.5-4.33V5a5,5,0,0,0-7.5-4.33L32.93,94.52A5,5,0,0,0,32.93,103.18Z' />
                </svg>
              </div>
              <div className='text-center text-lg mt-2'>{title}</div>
              <div className='text-center mt-2 text-sm  text-gray-5'>{desc}</div>
            </div>

            <FormItem name='username' label='账号' validateStatus={loginStatus}>
              <Input
                onChange={e => setForm(old => ({ ...old, username: e }))}
                prefix={<IconDesktop />}
                placeholder='请输入账户名'
                size='large'
              />
            </FormItem>
            <FormItem name='password' label='密码' validateStatus={loginStatus}>
              <Input
                type='password'
                onChange={e => setForm(old => ({ ...old, password: e }))}
                prefix={<IconLock />}
                placeholder='请输入密码'
                autoComplete='new-password'
                size='large'
              />
            </FormItem>
            <div className='mb-2'>
              <div id="VAPTCHAContainer" style={{
                height: '36px'
              }}>

                <div className='flex bg-gray-3 gap-4 items-center px-4 text-gray-6 fill-gray-5' style={{height:'36px'}}>
                  <svg  className='flex-none' xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink"
                        height="30px" viewBox="0 0 24 30"
                        space="preserve">
                    <rect x="0" y="9.22656" width="4" height="12.5469">
                      <animate attributeName="height" attributeType="XML" values="5;21;5" begin="0s" dur="0.6s"
                               repeatCount="indefinite"></animate>
                      <animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0s" dur="0.6s"
                               repeatCount="indefinite"></animate>
                    </rect>
                    <rect x="10" y="5.22656" width="4" height="20.5469">
                      <animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.15s" dur="0.6s"
                               repeatCount="indefinite"></animate>
                      <animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.15s" dur="0.6s"
                               repeatCount="indefinite"></animate>
                    </rect>
                    <rect x="20" y="8.77344" width="4" height="13.4531">
                      <animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.3s" dur="0.6s"
                               repeatCount="indefinite"></animate>
                      <animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.3s" dur="0.6s"
                               repeatCount="indefinite"></animate>
                    </rect>
                  </svg>
                  <div className='flex-grow'>人机验证加载中...</div>
                </div>
              </div>
            </div>
            <FormItem className="mb-0">
              <div>{loginStatus === 'error' ? <div className='text-danger'>{loginMessage}</div> : ''}</div>
              <div className='mt-3 w-full'>
                <Button type='primary' htmlType='submit' disabled={disabled} size='large' long loading={loading}>
                  登录
                </Button>
              </div>
              <div className='mt-6 text-center text-gray-5'>
                {copyright}
              </div>
            </FormItem>
          </Form>
        </div>
      </div>
    </div>
  )
}
