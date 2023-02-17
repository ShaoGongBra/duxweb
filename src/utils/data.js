import { QuickEvent } from './QuickEvent'

// eslint-disable-next-line no-redeclare
export class Cache {
  constructor({
    // 数据key
    key = '',
    defaultData
  }) {
    if (!key) {
      throw '使用Cache请设置Key'
    }
    this.config = {
      key
    }
    if (defaultData) {
      this.data = defaultData
    }
    this.init()
  }

  config = {
    key: '',
    readStatus: false
  }

  localEvent = new QuickEvent()

  data

  init() {
    const res = localStorage.getItem(this.config.key)
    if (res) {
      this.data = JSON.parse(res)
      this.config.readStatus = true
      this.localEvent.trigger(true, this.data)
    } else {
      this.config.readStatus = true
      this.localEvent.trigger(false, this.data)
    }
  }

  // 设置数据
  set = _data => {
    if (typeof _data === 'function') {
      this.data = _data(this.data)
    } else {
      this.data = _data
    }
    localStorage.setItem(this.config.key, JSON.stringify(this.data))
  }

  // 获取数据
  get = () => this.data

  // 监听读取了本地数据成功 需要在new之后立马创建监听 否则可能没有回调
  onLocal = this.localEvent.on

  // 异步获取数据，会等待本地缓存数据读取成功 返回一个Promise
  getAsync = async () => {
    if (this.config.readStatus) {
      return this.data
    }
    return new Promise(resolve => {
      const stop = this.onLocal(() => {
        stop.remove()
        resolve(this.data)
      })
    }, [])
  }
}

export class ObjectManage {
  constructor({
    // 是否将当前数据缓存到本地，要保存到本地需要设置key，下次读取的时候将调用最后一次设置的值
    cache,
    // 缓存数据key
    cacheKey = '',
    defaultData
  }) {
    if (defaultData) {
      this.data = defaultData
    }
    if (cache && cacheKey) {
      this.cache = new Cache({ key: cacheKey, defaultData })
      this.cache.getAsync().then(_data => {
        if (_data && this.data !== _data) {
          this.data = _data
          this.quickEvent.trigger(this.data, 'cache')
        }
      })
    }
  }

  // 缓存对象
  cache

  // 事件对象
  quickEvent = new QuickEvent()

  data = {}

  // 监听选中项改变事件
  onSet = this.quickEvent.on

  // 替换数据
  set = data => {
    if (typeof data === 'function') {
      this.data = data(this.data)
    } else {
      this.data = data
    }
    this.cache?.set(this.data)
    this.quickEvent.trigger(this.data, 'set')
  }

  // 清除数据
  clear = () => {
    this.data = {}
    this.execCallback()
    this.quickEvent.trigger(this.data, 'clear')
    this.cache?.set(this.data)
  }
}

export class ListManage {
  constructor(
    {
      // 当前列表的主键
      keyField = 'id',
      // 是否将当前列表选中项保存到本地，如果是空字符串则不保存 选中项保存到本地用的key
      savaSelectKey,
      // 默认选中项目项目的索引
      savaSelectDefaultIndex,
      // 将数据缓存到本地
      cache,
      // 缓存使用的key
      cacheKey
    } = {
      keyField: 'id'
    }
  ) {
    this.key = keyField
    this.savaSelectKey = savaSelectKey
    this.savaSelectDefaultIndex = savaSelectDefaultIndex
    // if (cache && cacheKey) {
    //   this.cache = new Cache({
    //     cacheKey,
    //     defaultData: {
    //       selectId: this.selectId,
    //       selectInfo: this.selectInfo,
    //       list: this.list
    //     }
    //   })
    //   this.cache.getAsync().then(_data => {
    //     if (this.data !== _data) {
    //       this.data = _data
    //       this.quickEvent.trigger(this.data)
    //     }
    //   })
    // }
  }

  cache

  key

  savaSelectKey
  savaSelectDefaultIndex

  selectId = 0

  selectInfo = {}

  list = []

  selectCallbacks = []

  listCallbacks = []

  itemCallback = {}

  on = (callback, list) => {
    list.push(callback)
    return {
      remove: () => {
        const index = list.indexOf(callback)
        ~index && list.splice(index, 1)
      }
    }
  }

  // 监听选中项改变事件
  onSelect = callback => {
    return this.on(callback, this.selectCallbacks)
  }

  // 监听列表改变
  onList = callback => {
    return this.on(callback, this.listCallbacks)
  }

  // 监听某一项改变
  onItem = (callback, id) => {
    if (!this.itemCallback[id]) {
      this.itemCallback[id] = []
    }
    return this.on(callback, this.itemCallback[id])
  }

  // 编辑或者添加一项或者多项
  edit = (...datas) => {
    datas.forEach(data => {
      const index = this.list.findIndex(item => item[this.key] === +data[this.key])
      if (~index) {
        this.list[index] = typeof data === 'object' ? { ...this.list[index], ...data } : data
        // 编辑了选中项则让选中项更新
        if (+data[this.key] === this.selectId) {
          this.execSelectCallback()
        }
      } else {
        this.list.push(data)
      }
      this.execItemCallback(data[this.key])
    })
    datas.length && this.execListCallback()
  }

  // 替换整个列表
  replace = (list = []) => {
    this.list = list
    // 存在选中项则判断是不是删除 并且让这一项更新
    if (this.selectId) {
      if (!list.some(item => item[this.key] === this.selectId)) {
        this.selectId = 0
      }
      this.execSelectCallback()
    }
    this.execListCallback()
    this.execItemCallback()
  }

  // 删除一项或多项
  delete = (...ids) => {
    if (
      ids.filter(id => {
        const index = this.list.findIndex(item => item[this.key] === +id)
        if (~index) {
          this.list.splice(index, 1)
          // 删除了选中项则更新
          if (+id === this.selectId) {
            this.selectId = 0
            this.execSelectCallback()
          }
          this.execItemCallback(+id)
          return true
        }
        return false
      }).length
    ) {
      this.execListCallback()
    }
  }

  // 清除数据
  clear = () => {
    this.list = []
    this.selectId = 0
    this.execItemCallback()
    this.execListCallback()
    this.execSelectCallback()
  }

  // 设置当前选中项
  select = async id => {
    if (this.selectId === +id) {
      return
    }
    let before = this.beforeSelectCallback?.(id)
    if (before instanceof Promise) {
      before = await before
    }
    if (before) {
      this.selectId = +id
      this.execSelectCallback()
    }
  }

  beforeSelectCallback = async () => true
  // 选中项前置操作
  beforeSelect = callback => {
    this.beforeSelectCallback = callback
  }

  async getSelect() {
    if (this.selectId) {
      return
    }
    try {
      if (this.savaSelectKey) {
        data = await localStorage.getItem(this.savaSelectKey)
        if (data) {
          // 在列表中存在选中项 则让其选中当前列表
          if (this.list.some(item => item[this.key] === data[this.key])) {
            this.select(data[this.key])
            return
          }
        }
      }
      throw '获取本地数据失败'
    } catch (error) {
      if (this.savaSelectDefaultIndex !== undefined && this.list.length) {
        this.select(this.list[0][this.key])
      }
    }
  }

  execSelectCallback() {
    const info = !this.selectId ? {} : this.list.find(item => item[this.key] === this.selectId) || {}
    // 从空变为空则不触发改变
    if (Object.keys(info).length === 0 && Object.keys(this.selectInfo).length === 0) {
      return
    }
    this.selectInfo = { ...info }
    // 将选中项保存到本地 供下次启动调用
    if (this.savaSelectKey) {
      localStorage.setItem(this.savaSelectKey, JSON.stringify(this.selectInfo))
    }
    this.selectCallbacks.forEach(item => item(this.selectInfo))
  }

  execItemCallback(id) {
    const keys = id ? [id] : Object.keys(this.itemCallback)
    keys.forEach(key => {
      const data = this.list.find(item => item[this.key] === +key) || {}
      this.itemCallback[key]?.forEach(cb => cb(data))
    })
  }

  execListCallback() {
    this.list = [...this.list]
    this.getSelect()
    this.listCallbacks.forEach(item => item(this.list))
  }
}
