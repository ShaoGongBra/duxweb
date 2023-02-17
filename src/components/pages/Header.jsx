import React from 'react'
import { Radio } from '@arco-design/web-react'

export default function Header({ title = '', menus, tools, tabs, index, onChange }) {
  return (
    <div className='flex flex-col gap-2 md:flex-row md:justify-between md:items-baseline '>
      <div className=' flex items-center justify-center gap-4 py-2 md:py-0'>
        {title && !tabs && <div className='text-title-1'>{title}</div>}
        {tabs && (
          <Radio.Group
            type='button'
            defaultValue={index}
            onChange={value => {
              onChange && onChange(value)
            }}
          >
            {tabs.map((item, key) => (
              <Radio key={key} value={item.value}>
                {item.name}
              </Radio>
            ))}
          </Radio.Group>
        )}
      </div>
      <div className='flex gap-2 flex-col md:flex-row'>
        {tools}
        {menus}
      </div>
    </div>
  )
}
