export { default as DuxWeb } from './Start'
export { default as Route, Navigation } from './Route'
export * from './Permission'
export * from './AppList'

import { user } from '../../utils'
import { Login } from './LoginPage'

// 注册一个默认用户配置
user.register({
  UserLogin: Login,
  // 强制登录
  force: true,
  // 当前是否开启了调试模式
  devOpen: false,
  // 用于判断是否登录的方法
  isLogin: data => !!data?.token,
  // 用户用户id的回调
  getUserID: data => data?.user_id
})
