import { useCharts } from '../charts/Charts'
import React, {useEffect, useState} from 'react'
import { DatePicker } from '@arco-design/web-react'
import {request} from "../../utils";
const { RangePicker } = DatePicker

export function StatsChart({
  card,
  title = '',
  subtitle = '',
  date = [],
  height = 200,
  chart = 'line',
  legend = false,
  url = '', // 预留url数据
  data = []
}) {

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

  const carts = useCharts()
    .setHeight(height)
    .setLegend(legend, 'right', 'top')
    /*.setData(
      '测试',
      [
        {
          label: '2022-12-01',
          value: 10
        }
      ],
      'YYYY-MM-DD'
    )*/

  chartData.forEach(item => {
    carts.setData(item['name'], item['data'], item['format'])
  })


  if (chart == 'line') {
    carts.line()
  }
  if (chart == 'column') {
    carts.column()
  }
  if (chart == 'area') {
    carts.area()
  }
  if (chart == 'ring') {
    carts.ring()
  }
  if (chart == 'radial') {
    carts.radial().setHeight(+height + 45)
  }

  if (date.length) {
    carts.setDate(date[0], date[1], 'YYYY-MM-DD')
  }

  function onSelect(value, context) {
    console.log('onChange:', value, context)
  }

  return (
    <div className={`p-4 rounded shadow-sm border border-color-2 bg-color-1 text-color-1`}>
      <div className='flex  flex-col md:flex-row gap-2 md:items-center md:justify-between'>
        <div className='flex gap-4 items-center'>
          <div className='text-color-1 text-title-1 font-bold'>{title}</div>
          <div className='text-color-2'>{subtitle}</div>
        </div>
        <div>{date.length ? <RangePicker className='flex' mode='date' value={date} onChange={onSelect} /> : ''}</div>
      </div>
      {carts.render()}
    </div>
  )
}
