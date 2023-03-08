
import React, { useMemo, useEffect } from 'react'
import { IconArrowUp, IconArrowDown } from '@arco-design/web-react/icon'
import { useCharts } from '../charts/Charts'
import {request} from "../../utils";

export function StatsCard({
  theme = 'default',
  name = '',
  desc = '',
  unit = '',
  chart = 'line',
  url = '', // 预留url数据
  data = [] // 预留数组数据
}) {
  const themeColor = useMemo(() => {
    let _themeColor = 'bg-color-2'
    switch (theme) {
      case 'primary':
        _themeColor = 'bg-primary'
        break
      case 'success':
        _themeColor = 'bg-success'
        break
      case 'warning':
        _themeColor = 'bg-warning'
        break
      case 'danger':
        _themeColor = 'bg-error'
        break
    }
    return _themeColor
  }, [theme])

  const [chartData, setChartData] = useState([])
  useEffect(() => {
    if (url) {
      request({
        url: url,
      }).then(res => {
        setChartData(res?.list || [])
      })
    }else {
      setChartData(data)
    }

  }, [url, data])

  const _chart = useCharts(theme)

  const [cart, cur] = useMemo(() => {
    let _cart = _chart
      .setMini(true)
      .setHeight(50)
      .setWidth(100)
      /*.setData(
        '测试',
        [
          {
            label: '2022-12-01',
            value: 10
          },
          {
            label: '2022-12-02',
            value: 5
          },
          {
            label: '2022-12-03',
            value: 4
          }
        ],
        'YYYY-MM-DD'
      )*/

    chartData.forEach(item => {
      _cart.setData(item['name'], item['data'], item['format'])
    })

    if (chart === 'line') {
      _cart.line()
    }
    if (chart === 'column') {
      _cart.column(false)
    }
    if (chart === 'area') {
      _cart.area()
    }

    let cartData = _cart.getSeriesData(0).slice(-2)
    let curValue = cartData[1] ?? 0
    let contrastValue = cartData[0] ?? 0
    let rate = ((curValue / contrastValue) * 100).toFixed(2)

    let footerColor
    let footerIcon
    if (curValue > contrastValue) {
      footerColor = 'text-error'
      footerIcon = <IconArrowUp className='w-3 h-3' />
    }
    if (curValue < contrastValue) {
      footerColor = 'text-success'
      footerIcon = <IconArrowDown className='w-3 h-3' />
    }
    if (curValue == contrastValue) {
      footerColor = 'text-primary'
      footerIcon = <div>-</div>
    }

    return [_cart.render(), { curValue, footerColor, footerIcon, rate }]
  }, [_chart])

  return (
    <div className={`p-4 rounded shadow-sm text-color-2 border border-color-2 ${themeColor}`}>
      <div className={` ${theme !== 'default' ? 'text-white' : 'text-color-1'}`}>{name}</div>
      <div className='flex justify-between items-center mt-1'>
        <div className={`text-2xl ${theme !== 'default' ? 'text-white' : ''}`}>
          {unit}
          {cur.curValue}
        </div>
        <div>{cart}</div>
      </div>
      <div
        className={`mt-1 flex gap-1 items-center ${cur.footerColor}  ${theme !== 'default' ? 'text-white text-opacity-70' : ''
          }`}
      >
        {cur.footerIcon}
        <div>
          {cur.rate}% {desc}
        </div>
      </div>
    </div>
  )
}
