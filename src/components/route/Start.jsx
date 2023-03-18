import React, {memo, useEffect, useMemo, useState} from 'react'
import {OverlayScrollbarsComponent} from 'overlayscrollbars-react'
import {Avatar, Button, Dropdown, Menu} from '@arco-design/web-react'
import {IconDown, IconMoreVertical, IconRight} from '@arco-design/web-react/icon'
import {deepCopy, route, theme, useDocSize, useMenu, user, useRoute} from '../../utils'
import User from './User'

import './Start.css'
import RoutePage from './Route'
import * as qs from 'qs'

const dropList = (
  <Menu>
    <Menu.Item key='1'>我的消息</Menu.Item>
    <Menu.Item key='2' onClick={() => {
      route.push('userSetting')
    }}>修改资料</Menu.Item>
    <Menu.Item key='3' onClick={user.loginOut}>
      退出登录
    </Menu.Item>
  </Menu>
)

const UserMenu = ({position = 'rb'}) => {
  return (
    <Dropdown position={position} trigger='click' droplist={dropList}>
      <Avatar size={30}>admin</Avatar>
    </Dropdown>
  )
}

const Logo = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 202.97 197.7'
    className='rounded w-4 p-2 cursor-pointer fill-white bg-primary'
  >
    <path
      d='M170,94.52l-35.9-20.73-24.34,14,11.62,6.71a5,5,0,0,1,0,8.66L32.5,154.52a5,5,0,0,1-7.5-4.33V99.61a6.44,6.44,0,0,1,0-1.52V47.51a5,5,0,0,1,7.5-4.33l35,20.23,24.32-14L7.5.68A5,5,0,0,0,0,5V192.69A5,5,0,0,0,7.5,197L170,103.18A5,5,0,0,0,170,94.52Z'/>
    <path
      d='M32.93,103.18l35.9,20.73,24.34-14-11.62-6.71a5,5,0,0,1,0-8.66l88.92-51.34a5,5,0,0,1,7.5,4.33V98.09a6.44,6.44,0,0,1,0,1.52v50.58a5,5,0,0,1-7.5,4.33l-35-20.23-24.32,14L195.47,197a5,5,0,0,0,7.5-4.33V5a5,5,0,0,0-7.5-4.33L32.93,94.52A5,5,0,0,0,32.93,103.18Z'/>
  </svg>
)

const LayoutSide = memo(({children}) => {
  const menuData = useMenu()

  const allMenu = useMemo(() => {
    const appIndex = [0, 0]
    return menuData.map((item, index) => {
      if (item.extend) {
        item.index = [index, appIndex[1]++, true]
      } else {
        item.index = [index, appIndex[0]++, false]
      }
      return item
    })
  }, [menuData])


  const [expands, setExpands] = useState([])
  const [collapsed, setCollapsed] = useState(false)
  const [mobileCollapsed, setMobileCollapsed] = useState(false)

  const {currentState} = useRoute()

  const [oldActive, active] = useMemo(() => {
    // 找到默认选中的菜单
    const getMatch = url => {
      if (!url) {
        return false
      }
      const _data = url.split('?')
      if (_data[0].startsWith('/')) {
        _data[0] = _data[0].substring(1)
      }
      if (!_data[1]) {
        _data[1] = ''
      }
      _data[1] = qs.parse(_data[1])
      const [path, query] = _data
      if (
        path === currentState.path &&
        Object.keys(currentState.params).every(key => currentState.params[key] == query[key])
      ) {
        return 10
      }

      const paths = path.split('/')
      const currentPaths = currentState.path?.split('/') || []
      const index = currentPaths.findIndex((item, i) => item !== paths[i])
      return ~index ? index : currentPaths.length
    }

    const _active = [0, []]

    const getActive = (list = allMenu, indexs = []) => {
      const level = indexs.length
      return list?.some((item, i) => {
        indexs[level] = item.index ?? i
        if (item.children?.length) {
          return getActive(item.children, [...indexs])
        } else {
          const match = getMatch(item.url)
          if (match === 10) {
            _active[1] = indexs
            return true
          } else if (match > _active[0]) {
            _active[0] = match
            _active[1] = indexs
          }
          return false
        }
      })
    }
    getActive()
    return [
      _active[1]?.[0],
      [
        _active[1]?.[0]?.[2] ? allMenu.filter(item => !item.extend).findIndex(item => item.manage) : _active[1]?.[0]?.[1],
        ...(_active[1]?.slice(1) || [])
      ]
    ]
  }, [allMenu, currentState])

  const menu = useMemo(() => {
    const _menu = deepCopy(allMenu.filter(item => !item.extend))
    const manageIndex = _menu.findIndex(item => item.manage)
    if (~manageIndex) {
      _menu[manageIndex].children = oldActive?.[2] ? allMenu[oldActive[0]].children : []
    }
    return _menu
  }, [allMenu, oldActive])

  useEffect(() => {
    setPanel(active[0])
  }, [active])

  const [panel, setPanel] = useState(active[0])

  // 在 document 上绑定点击事件，隐藏弹出层
  useEffect(() => {
    const clickFun = () => setExpands([])
    document.addEventListener('click', clickFun, false)
  }, [])

  // 封装后的阻止冒泡功能
  const stopPropagation = e => {
    e.nativeEvent.stopImmediatePropagation()
  }

  const [size, sizeType] = useDocSize()

  useEffect(() => {
    // 监听页面宽度
    setCollapsed(size < sizeType.xl)
  }, [size, sizeType])

  return (
    <>
      <div className='flex-none'>
        <div className='md:hidden '>
          <div className='flex justify-between items-center bg-color-1 border-b border-color-2 p-2'>
            <div>
              <Button
                type='text'
                className='!text-color-1 text-title-1'
                icon={<IconMoreVertical/>}
                onClick={() => {
                  setMobileCollapsed(!mobileCollapsed)
                }}
              ></Button>
            </div>
            <div>
              <div className='flex items-center justify-center' onClick={theme.switchMode}>
                <Logo/>
              </div>
            </div>
            <div>
              <UserMenu position='lt'/>
            </div>
          </div>
          {mobileCollapsed && (
            <div className='flex flex-col p-2 bg-gray-2'>
              {menu.map((app, appKey) => {
                return (
                  <div key={appKey}>
                    <div
                      className={`flex items-center py-2 px-2 rounded hover:bg-gray-3 justify-between ${active[0] == appKey && 'text-primary'}`}
                      onClick={() => {
                        if (app.url) {
                          route.push(app.url)
                        } else {
                          app.expand = !app.expand
                        }
                      }}
                    >
                      <div className='flex gap-2 items-center'>
                        <div className={`${app.icon} text-base`}/>
                        {app.name}
                      </div>
                      <div>{app.expand == true ? <IconDown/> : <IconRight/>}</div>
                    </div>
                    {!!app.children?.length && (
                      <div className={`p-l-10 flex-col ${app.expand == true ? 'flex' : 'hidden'}`}>
                        {app.children.map((parent, parentKey) => {
                          return (
                            <div key={'' + appKey + parentKey}>
                              <div
                                className={`flex items-center gap-2 py-2 px-2 rounded hover:bg-gray-3  ${active[0] == appKey && active[1] == parentKey && 'text-primary'}`}
                                onClick={() => {
                                  parent.expand = !parent.expand
                                }}
                              >
                                {parent.name}
                              </div>
                              {parent.children && (
                                <div className={`p-l-7 flex-col ${parent.expand == true ? 'flex' : 'hidden'}`}>
                                  {parent.children.map((sub, subKey) => (
                                    <div
                                      key={'' + appKey + parentKey + subKey}
                                      className={`flex items-center gap-2 py-2 px-2 rounded hover:bg-gray-3 ${active[0] == appKey &&
                                      active[1] == parentKey &&
                                      active[2] == subKey &&
                                      'text-primary'}`}
                                      onClick={() => {
                                        route.push(sub.url)
                                      }}
                                    >
                                      {sub.name}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className='hidden md:flex '>
          <div className='h-screen bg-dark-800 w-16 flex text-gray-6 flex-col z-1 border-color-2 border-r'>
            <div className='py-6 flex justify-center items-center '>
              <div onClick={() => setCollapsed(!collapsed)}>
                <Logo/>
              </div>
            </div>
            <OverlayScrollbarsComponent
              defer
              options={{scrollbars: {autoHide: 'scroll'}}}
              className='flex-auto py-4'
            >
              <div className='flex flex-col gap-4'>
                {menu.map((app, appKey) => {
                  return (
                    <div key={appKey}>
                      <div
                        className={`cursor-pointer flex items-center justify-center flex-col gap-1 relative ${panel == appKey ? 'color-white' : ''}`}
                        onClick={e => {
                          stopPropagation(e)
                          if (app.url) {
                            route.push(app.url)
                          } else {
                            setExpands([appKey])
                            setPanel(appKey)
                          }
                        }}
                      >
                        <div className={`${app.icon} text-xl`}/>
                        <div className='text-xs'>{app.name}</div>
                        {panel == appKey && <div className='absolute w-3px bg-primary-7 h-full left-0'></div>}
                      </div>
                      {app.children?.length > 0 && (
                        <div
                          className={`rounded-sm bg-color-1 fixed left-16 w-35 shadow flex-col gap-1 p-2 -mt-11 ${collapsed && expands[0] == appKey ? 'flex' : 'hidden'}`}
                        >
                          {app.children.map((parent, parentKey) => {
                            return (
                              <div key={'' + appKey + parentKey}>
                                <div
                                  className={` hover:text-primary rounded-sm px-2 py-1.5 cursor-pointer ${(active[0] == appKey && active[1] == parentKey) ||
                                  (expands[0] == appKey && expands[1] == parentKey)
                                    ? 'text-primary-7'
                                    : ''}`}
                                  onClick={e => {
                                    stopPropagation(e)
                                    setExpands([appKey, parentKey])
                                  }}
                                >
                                  {parent.name}
                                </div>
                                {parent.children && (
                                  <div
                                    className={`rounded-sm bg-color-1 absolute left-40 w-35 shadow  flex-col gap-2 p-2 -mt-10.5 ${collapsed && expands[0] == appKey && expands[1] == parentKey ? 'flex' : 'hidden'}`}
                                  >
                                    {parent.children.map((sub, subKey) => {
                                      return (
                                        <div
                                          key={'' + appKey + parentKey + subKey}
                                          className={`px-2 py-1.5 rounded-sm hover:text-primary cursor-pointer ${active[0] == appKey && active[1] == parentKey && active[2] == subKey
                                            ? 'text-primary-7 '
                                            : ''}`}
                                          onClick={() => {
                                            // 跳转url
                                            route.push(sub.url)
                                          }}
                                        >
                                          {sub.name}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </OverlayScrollbarsComponent>
            <div className='py-4 flex flex-col gap-4'>
              <div>
                <div
                  className='hover:text-primary-7 cursor-pointer rounded-sm flex items-center justify-center flex-col gap-0.5'>
                  <div className='i-fluent:dark-theme-20-regular w-5 h-5' onClick={theme.switchMode}/>
                </div>
              </div>

              <div>
                <div className='cursor-pointer flex items-center justify-center flex-col '>
                  <UserMenu/>
                </div>
              </div>
            </div>
          </div>
          {!!menu[panel]?.children?.length && !collapsed && (
            <div
              className='h-screen bg-color-1 text-color-1 p-2 overflow-hidden  z-1 visible opacity-100 w-40 border-r border-color-2'
            >
              <OverlayScrollbarsComponent defer options={{scrollbars: {autoHide: 'scroll'}}} className='h-full'>
                {menu[panel].children.map((parent, parentKey) => {
                  return (
                    <div key={parentKey}>
                      <div className='px-2 py-4 text-color-3 text-body-caption'>{parent.name}</div>
                      <div className='flex flex-col gap-1'>
                        {parent.children &&
                          parent.children.map((sub, subKey) => {
                            return (
                              <div
                                key={subKey}
                                className={` p-2 cursor-pointer  rounded ${active[0] == panel && active[1] == parentKey && active[2] == subKey
                                  ? 'bg-gray-2 text-primary'
                                  : ''}`}
                                onClick={() => {
                                  // 跳转url
                                  route.push(sub.url)
                                }}
                              >
                                {sub.name}
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )
                })}
              </OverlayScrollbarsComponent>
            </div>
          )}
        </div>
      </div>
      {children}
    </>
  )
})

export default function Start() {

  // const notify = (status) => {
  //   if (!status) {
  //     return
  //   }
  //   request({
  //     url: 'notify'
  //   }).then(res => {
  //     console.log(res)
  //     setTimeout(() => {
  //       notify(status)
  //     }, 5000)
  //   })
  // }

  // useEffect(() => {
  //   notify(true)
  // }, [])

  return (
    <User>
      <div className='app-layout h-screen flex flex-col md:flex-row bg-gray-2 text-color-1'>
        <LayoutSide>
          <RoutePage/>
        </LayoutSide>
      </div>
    </User>
  )
}
