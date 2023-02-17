import { useEffect, useMemo, useState } from 'react'
import { ObjectManage } from './data'

class Theme extends ObjectManage {
  constructor(props) {
    super(props)
    const { remove } = this.onSet((data, type) => {
      if (type === 'cache') {
        remove()
        if (data?.mode === 'dark') {
          document.body.classList.add('dark')
          document.body.setAttribute('arco-theme', 'dark')
        }
      }
    })
  }

  data = {
    mode: 'light'
  }

  /**
   * 获取当前模式
   */
  mode = () => this.data.mode

  /**
   * 切换模式
   */
  switchMode = () => {
    this.set(old => {
      old.mode = old.mode === 'dark' ? 'light' : 'dark'
      if (old.mode === 'dark') {
        document.body.classList.add('dark')
        document.body.setAttribute('arco-theme', 'dark')
      } else {
        document.body.classList.remove('dark')
        document.body.removeAttribute('arco-theme')
      }
      return { ...old }
    })
  }
}

export const theme = new Theme({
  cache: true,
  cacheKey: 'theme-config'
})

/**
 * 主题数据
 * @returns
 */
export const useTheme = () => {
  const [data, setData] = useState(theme.data)

  useEffect(() => {
    const { remove } = theme.onSet(setData)
    return () => remove()
  }, [])

  const result = useMemo(() => [data, theme], [data])

  return result
}

/**
 * 是否是暗黑模式
 * @returns
 */
export const useThemeDark = () => {
  const [dark, setDark] = useState(theme.data.mode === 'dark')

  useEffect(() => {
    const { remove } = theme.onSet(data => setDark(data.mode === 'dark'))
    return () => remove()
  }, [])

  const result = useMemo(() => [dark, theme], [dark])

  return result
}
