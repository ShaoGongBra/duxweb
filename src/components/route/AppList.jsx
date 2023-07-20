import React, {useEffect, useMemo, useState} from 'react'
import {Page} from '../pages'
import {request, route, useMenu} from '../../utils'
import {Result} from '@arco-design/web-react';

export const AppList = () => {

  const menu = useMenu()

  const list = useMemo(() => menu.filter(item => item.extend), [menu])

  const [data, setData] = useState([])

  useEffect(() => {
    request({
      url: 'system/app/label'
    }).then(res => {
      let arr = []
      list.map(item => {
        if (!arr[item.label]) {
          arr[item.label] = []
        }
        arr[item.label].push(item)
      })
      let data = res.list.map(item => {
        if (!arr[item.label]) {
          return;
        }
        item.list = arr[item.label] || []
        return item
      }).filter(item => item)
      setData(data)
    })
  }, [list])


  return (
    <Page>
      {data.length ? data.map((v, k) => v?.list && (
        <div key={k}>
          <div className='mb-3 text-title-1 border-l-5 border-primary-7 pl-3'>{v.name}</div>
          <div className='flex gap-2 flex-wrap mb-5'>
            {v?.list.map((item, index) => (
              <div key={index} onClick={() => route.push(item.url || item.children?.[0]?.url || item.children?.[0]?.children?.[0]?.url)} className='w-100 bg-color-1 shadow-sm rounded flex items-center gap-4 p-5 border border-color-1 hover:border-primary-7 hover:bg-primary-1 cursor-pointer'>
                <div className='flex-none'>
                  <div className={`bg-${item.color}-7 w-12 h-12 text-display-1 flex items-center justify-center rounded`}>
                    <div className={`${item.icon} text-white`}></div>
                  </div>
                </div>
                <div className='flex-grow w-1'>
                  <div className='text-color-1 text-title-1'>{item.name}</div>
                  <div className='text-color-2 truncate'>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )) : <div className='flex h-full w-full items-center'>
        <Result
          status='404'
          title='暂无应用'
          subTitle='该系统暂无安装的应用，您可以联系管理员安装'

        ></Result>
      </div>}
    </Page>
  )
}