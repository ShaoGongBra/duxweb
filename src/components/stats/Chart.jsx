import { useCharts } from '../charts/Charts'
import React, { useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, Message } from '@arco-design/web-react'
import { request } from "../../utils"
import { route } from "duxweb";

const { RangePicker } = DatePicker

export function StatsChart({
  title = '',
  subtitle = '',
  date = [],
  dateFormat = 'YYYY-MM-DD',
  dateWay = 'days',
  height = 200,
  chart = 'line',
  legend = false,
  url,
  fastDate = []
}) {

  const [chartData, setChartData] = useState([])
  const [chartDate, setChatDate] = useState(date)

  const getData = () => {
    if (!url) {
      return
    }
    request({
      url: url,
      data: {
        start_date: chartDate?.[0],
        stop_date: chartDate?.[1],
      }
    }).then(res => {
      setChartData(res?.list || [])
    }).catch(res => {
      Message.error(res.message)
    })
  }

  useEffect(() => {
    getData()
  }, [url, chartDate])


  const _cart = useCharts()

  const [cart] = useMemo(() => {
    _cart
      .setHeight(height)
      .setLegend(legend, 'right', 'top')
    // .setData(
    //   '测试33',
    //   [
    //     {
    //       label: '2022-12-01',
    //       value: 10
    //     }
    //   ],
    //   'YYYY-MM-DD'
    // )

    chartData.forEach(item => {
      _cart.setData(item['name'], item['data'], dateFormat)
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
    if (chart === 'ring') {
      _cart.ring()
    }
    if (chart === 'radial') {
      _cart.radial().setHeight(+height + 45)
    }

    if (date.length) {
      _cart.setDate(chartDate?.[0], chartDate?.[1], dateFormat, dateWay)
    }

    return [_cart.render()]
  }, [chartData])

  return (
    <div className={`p-4 rounded shadow-sm border border-color-2 bg-color-1 text-color-1`}>
      <div className='flex  flex-col md:flex-row gap-2 md:items-center md:justify-between'>
        <div className='flex gap-4 items-center h-10'>
          <div className='text-color-1 text-title-1 font-bold'>{title}</div>
          <div className='text-color-2'>{subtitle}</div>
        </div>
        <div className='flex flex-col md:flex-row gap-4 md:items-center'>
          {!!fastDate?.length && <div className='md:max-w-150'>
            {fastDate.map((item) => (
              <Button size='small' type='text'
                onClick={() => {
                  setChatDate(item.value)
                }}>
                {item.label}
              </Button>
            ))}
          </div>}
          <div className='md:max-w-150'>
            {date.length ? <RangePicker mode='date' value={chartDate} onChange={(value) => {
              setChatDate(value)
            }} /> : ''}
          </div>
        </div>
      </div>
      {cart}
    </div>
  )
}
