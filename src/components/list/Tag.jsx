import React from 'react'
import {Tag} from '@arco-design/web-react'

export function ListTag({data, icon, empty, color}) {
  return (
    <div className='flex gap-2'>
      {data.length ? data.map((v, i) => (
        <Tag key={i} bordered color={color} icon={icon}>
          {v}
        </Tag>
      )) : empty || '-'}
    </div>
  )
}
