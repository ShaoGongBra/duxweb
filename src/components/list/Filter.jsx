import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Button as ArcoButton, Form } from '@arco-design/web-react'
import { useDocSize, createContext, route, useRouter, deepCopy } from '../../utils'

const FormItem = Form.Item


const [filterContext, useFilterContext] = createContext([{}, {}])

export const Filter = ({
  children,
  // 绑定地址栏的url
  bindUrl,
  // 是否快速响应 当输入的时候就获得结果
  quick = true,
  defaultData: propsDefaultData
}) => {

  const { params } = useRouter()

  const defaultData = useMemo(() => {
    if (bindUrl) {
      return { ...propsDefaultData, ...params }
    } else {
      return propsDefaultData || {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [realData, setRealData] = useState({ ...defaultData })

  // 将值保存起来
  const realDataRef = useRef(realData)
  realDataRef.current = realData

  const [resultData, setResultData] = useState({ ...defaultData })

  useEffect(() => {
    bindUrl && route.change(resultData)
  }, [resultData, bindUrl])

  useEffect(() => {
    if (quick) {
      setResultData(old => {
        return JSON.stringify(old) === JSON.stringify(realData) ? old : deepCopy(realData)
      })
    }
  }, [quick, realData])

  const setValue = useCallback((key, value) => {
    setRealData(old => {
      old[key] = value
      return { ...old }
    })
  }, [])

  const setValues = useCallback(data => {
    setRealData(old => ({ ...old, ...data }))
  }, [])

  const submit = useCallback(() => {
    if (quick) {
      return
    }
    setResultData(realDataRef.current)
  }, [quick])

  const reset = useCallback(() => {
    setRealData({ ...defaultData })
    setResultData({ ...defaultData })
  }, [defaultData])

  const result = [resultData, { realData, setValue, setValues, submit, reset }]

  return <filterContext.Provider value={result}>
    {
      typeof children === 'function'
        ? children(result)
        : children
    }
  </filterContext.Provider>
}

const Item = ({
  children,
  trigger = 'onChange',
  triggerPropName = 'value',
  field
}) => {

  const [, filter] = useFilterContext()

  const value = filter.realData[field]

  const child = useMemo(() => {
    let _child = children
    if (typeof children === 'function') {
      _child = children({ value, ...filter })
    }
    if (React.isValidElement(_child)) {
      _child = React.cloneElement(_child, {
        [trigger]: _child[trigger] || (_value => filter.setValue(field, _value)),
        [triggerPropName]: _child[triggerPropName] || value
      })
    }
    return _child
  }, [children, field, filter, trigger, triggerPropName, value])

  return child
}

const Submit = props => {
  const [, filter] = useFilterContext()
  return <ArcoButton type='primary' {...props} onClick={filter.submit} />
}

const Reset = props => {
  const [, filter] = useFilterContext()
  return <ArcoButton {...props} onClick={filter.reset} />
}

Filter.useFilterContext = useFilterContext
Filter.Item = Item
Filter.Submit = Submit
Filter.Reset = Reset

export const FilterList = ({ items, tableData, className }) => {
  const [size, sizeType] = useDocSize()

  return (
    <div className={className}>
      <Form
        autoComplete='off'
        layout={size > sizeType.lg ? 'horizontal' : 'vertical'}
        labelAlign='right'
        className='flex flex-col md:flex-row gap-4'
      >
        <div
          className={`flex-wrap gap-4 flex-auto ${items?.length >= 3 ? 'grid 2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2 grid-cols-1' : 'flex flex-col md:flex-row'}`}>
          {
            items?.map?.((vo, key) => <FormItem key={key} noStyle>
              <div className='flex flex-col md:flex-row md:items-center gap-4 '>
                <div className='flex-none md:min-w-20 md:text-right'>{vo?.title}</div>
                <div className='flex-auto'>
                  <Item field={vo?.name}>
                    {typeof vo?.render === 'function' ? vo?.render({ tableData }) : vo?.render}
                  </Item>
                </div>
              </div>
            </FormItem>)
          }
        </div>
      </Form>
    </div>
  )
}