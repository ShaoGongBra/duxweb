import { useEffect, useState } from 'react'
import { QuickEvent } from './QuickEvent'

export class System {
  static currentValue = ''

  static defaultSystem = ''

  static changeEvent = new QuickEvent()

  static onChange = this.changeEvent.on

  static set current(value) {
    this.currentValue = value
    this.changeEvent.trigger(this.currentValue)
  }

  static get current() {
    if (!this.currentValue) {
      this.currentValue = this.defaultSystem || location.hash.split('?')[0].split('/')[1] || 'admin'
      this.changeEvent.trigger(this.currentValue)
    }
    return this.currentValue
  }
}

/**
 * 监听跳转到不同的端刷新页面
 */
(() => {
  let prevCurrent = System.current
  window.addEventListener('popstate', e => {
    const current = location.hash.split('?')[0].split('/')[1]
    if (prevCurrent !== current) {
      prevCurrent = current
      location.reload()
    } else if (!e.state) {
      location.reload()
    }
  })
})();

export const useSystem = () => {
  const [system, setSystem] = useState(System.current)

  useEffect(() => {
    const { remove } = System.onChange(setSystem)
    return () => remove()
  }, [])

  return system
}
