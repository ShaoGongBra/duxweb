import { createContext, useMemo, useContext, useState, useEffect, Component } from 'react'
import { deepCopy } from './object'
import * as qs from 'qs'
import { ObjectManage } from './data'
import { System, useSystem } from './system'
import { request } from './request'
import { user } from './user'

const { routeList, registerRoutes, registerGlobalRoute } = (() => {
  const _routeList = {
    __global: {}
  }

  const reactSymbols = ['Symbol(react.lazy)', 'Symbol(react.memo)', 'Symbol(react.forward_ref)']

  const getRoute = (child, path) => {
    child && Object.keys(child).forEach(key => {
      const value = child[key]
      if (
        typeof value === 'function' // 函数组件
        || value instanceof Component // 类组件
        || (typeof value === 'object' && reactSymbols.includes(value['$$typeof']?.toString?.())) // 被react函数包裹的组件
      ) {
        _routeList[[...path, key].join('/')] = value
      } else if (typeof value === 'object') {
        getRoute(value, [...path, key])
      } else {
        console.error('未知的路由类型', path.join('/'), value)
      }
    })
  }

  return {
    routeList: _routeList,
    registerRoutes: list => {
      // 清空路由
      Object.keys(_routeList).forEach(key => {
        if (key === '__global') {
          return
        }
        delete _routeList[key]
      })
      list.forEach(([system, app, route, config = {}]) => {
        getRoute(route, [system, config.appName || app])
      })
    },
    registerGlobalRoute: (url, page) => {
      _routeList.__global[url] = page
    }
  }
})()

class Menu extends ObjectManage {
  constructor(props) {
    super(props)
    this.init()
  }

  init = () => {
    setTimeout(() => {
      this.getOnlineMenu()
      System.onChange(this.getOnlineMenu)
    }, 0)
  }

  /**
   * 注册本地菜单列表
   * @param {array} list 菜单
   * @returns
   */
  registerMenus = list => {
    // 清空菜单
    Object.keys(this.data).forEach(key => {
      delete this.data[key]
    })
    return (
      list
        .filter(item => item[2])
        .map(([system, app, menu]) => {
          return menu({
            app: (option, children) => {
              return {
                app,
                ...option,
                type: 'app',
                system,
                children
              }
            },
            item: (option, children) => {
              if (typeof option === 'string') {
                option = { name: option }
              }
              return {
                ...option,
                type: 'item',
                system,
                children
              }
            },
            hasApp: (_app, children) => {
              return {
                type: 'hasApp',
                app: _app,
                source: app,
                system,
                children
              }
            }
          })
        })
        .flat()
        // 按系统分组
        .reduce((prev, app, index, arr) => {
          if (!prev[app.system]) {
            prev[app.system] = { menus: [], system: app.system }
          }
          prev[app.system].menus.push(app)
          if (index === arr.length - 1) {
            return Object.values(prev)
          }
          return prev
        }, {})
        .forEach(({ menus, system }) => {
          this.data[system] = menus.reduce(
            (prev, app, index, arr) => {
              if (app.type === 'app') {
                prev.apps[app.app] = app
              } else if (app.type === 'hasApp') {
                prev.hasApps.push(app)
              } else if (app.type === 'item') {
                prev.pages.push(app)
              } else {
                throw '不支持在顶层返回的类型：' + app.type
              }
              if (index === arr.length - 1) {
                if (Object.keys(prev.apps).length && prev.pages.length) {
                  throw '不能同时使用app和item返回菜单'
                }
                if (prev.hasApps.length) {
                  prev.hasApps.forEach(hasApp => {
                    if (prev.apps[hasApp.app]) {
                      console.error(`${hasApp.app} 模块不存在，无法将菜单注册到这个模块`)
                    } else {
                      prev.apps[hasApp.app].menus.push(...hasApp.children)
                    }
                  })
                }
                if (prev.pages.length) {
                  return prev.pages
                } else {
                  // 排序
                  return Object.values(prev.apps).sort(({ order: oa = 50 }, { order: ob = 50 }) => oa - ob)
                }
              }
              return prev
            },
            { apps: {}, hasApps: [], pages: [] }
          )
        }, {})
    )
  }

  getOnlineMenu = () => {
    if (this.data[System.current]) {
      route.init()
      return
    }
    if (user.getCurrentConfig().force === false) {
      route.init()
    } else {
      const { remove } = user.onLoginStatus(async status => {
        if (status) {
          const res = await request({
            url: 'menu'
          })
          this.data[System.current] = res.main
          if (res?.permission !== undefined) {
            user.setInfo({ permission: res.permission })
          }
          route.init()
          this.set({ ...this.data })
          remove()
        }
      })
    }
  }
}

export const menu = new Menu({})

export const useMenu = () => {
  const system = useSystem()

  const [data, setData] = useState(menu.data[system] || [])

  useEffect(() => {
    const { remove } = menu.onSet(_data => {
      setData(_data[system])
    })
    menu.data[system] && setData(menu.data[system])
    return () => remove()
  }, [system])

  return data
}

export { routeList, registerRoutes, registerGlobalRoute }

export class RouteManage extends ObjectManage {
  static Context = createContext({})

  static numReg = /^(([^0][0-9]+|0)\.([0-9]{1,})$)|^(([^0][0-9]+|0)$)|^(([1-9]+)\.([0-9]{1,})$)|^(([1-9]+)$)/

  static numTransform = data => {
    if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key) && typeof data[key] === 'string' && this.numReg.test(data[key])) {
          data[key] = +data[key]
        }
      }
    }
    return data
  }

  /**
   * 将url和data参数进行合并 转换为新的url
   * @param {string} url
   * @param {object} data
   * @returns
   */
  static toUrl = (url, data = {}) => {
    let [path, query = ''] = url.split('?')
    const params = this.numTransform({ ...qs.parse(query), ...data })
    path = url.startsWith('/') ? path.substring(1) : path
    const system = System.current

    return {
      webUrl: `${location.pathname}${location.search}#/${system}/${path}${Object.keys(params).length ? '?' + qs.stringify(params) : ''}`,
      url: `${path}${Object.keys(params).length ? '?' + qs.stringify(params) : ''}`,
      params,
      path,
      system
    }
  }

  constructor() {
    super({})
  }

  data = {
    currentState: {},
    modal: []
  }

  init = (() => {
    const popstateCallback = e => {
      this.data.currentState = e.state
      this.set({ ...this.data })
    }
    let status = false

    const getIndexPage = () => {
      const callback = list => {
        if (list[0]?.url) {
          return list[0]?.url
        } else if (list[0]?.children?.length) {
          return callback(list[0].children)
        } else {
          return ''
        }
      }
      return callback(menu.data[System.current])
    }
    return () => {
      if (!status) {
        status = true
        window.addEventListener('popstate', popstateCallback)
        setTimeout(() => {
          // 等待路由注册成功再执行获取默认路由的操作
          const [, , ...hash] = location.hash.substring(1).split('/')
          const urlData = RouteManage.toUrl(hash.join('/') || getIndexPage())
          if (!urlData.system) {
            throw '菜单配置错误 请在第一个app中配置链接'
          }
          this.replace(urlData.path, urlData.params)
        }, 0)
      }
    }
  })()

  // 跳转新页面
  push = (url, params) => {
    const state = (this.data.currentState = {
      ...RouteManage.toUrl(url, params),
      agree: 'push'
    })
    this.set({ ...this.data })
    history.pushState(state, state.webUrl, state.webUrl)
  }
  // 替换跳转到新页面
  replace = (url, params) => {
    const state = (this.data.currentState = {
      ...RouteManage.toUrl(url, params),
      agree: 'replace'
    })
    this.set({ ...this.data })
    history.replaceState(state, state.webUrl, state.webUrl)
  }
  // 替换当前路由的参数 路由本身不会发生任何变化
  change = params => {
    const state = {
      ...RouteManage.toUrl(location.hash.substring(2).split('?')[0].split('/').slice(1).join('/'), params),
      agree: this.data.currentState?.agree,
      change: true
    }
    history.replaceState(state, state.webUrl, state.webUrl)
  }

  modalData = {
    key: 0
  }

  /**
   * 回退页面
   * @param {number} num 回退多少个页面 默认1
   */
  back = (num = 1) => history.go(-num)

  // 跳转到弹框
  modal = (url, params, config) => {
    const key = this.modalData.key++

    const data = {
      ...RouteManage.toUrl(url, params),
      key,
      config
    }
    this.data.modal = [...this.data.modal, data]
    this.set({ ...this.data })
    return {
      key,
      getData: () =>
        new Promise((resolve, reject) => {
          data.callback = [resolve, reject]
        })
    }
  }

  /**
   * 关闭弹窗 总是关闭最上层的弹窗
   * @param {any} data 要传递的数据 在调用打开弹窗的地方可以获取到这些数据
   */
  closeModal = data => {
    const index = this.data.modal.length - 1
    if (~index) {
      const [item] = this.data.modal.splice(index, 1)
      item.callback?.[0]?.(data)
      this.set({ ...this.data })
    } else {
      console.log('没有可以关闭的弹窗')
    }
  }
}

export const route = new RouteManage()

export const useRoute = () => {

  const [data, setData] = useState(route.data)

  useEffect(() => {
    const { remove } = route.onSet(setData)
    route.data && setData(route.data)
    return () => remove()
  }, [])

  return data
}

export const useRouter = () => {
  const { state } = useContext(RouteManage.Context)

  const data = useMemo(() => deepCopy(state), [state])

  return data
}
