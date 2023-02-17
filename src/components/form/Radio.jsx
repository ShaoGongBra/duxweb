import React from 'react'
import { Radio } from '@arco-design/web-react'

export function CardRadio(config = {}) {
  return (
    <Radio.Group className='card-checkbox-group' {...config} options>
      <div className={`flex gap-2 flex-col  flex-warp ${config?.direction == 'vertical' ? '' : 'lg:flex-row'}`}>
        {config?.options.map((item) => {
          return (
            <Radio key={item.value} value={item.value}>
              {({checked}) => {
                return (
                  <div className={`flex items-start gap-2 card-checkbox-card ${config?.direction !== 'vertical' && 'lg:min-w-60'} ${checked ? 'card-checkbox-card-checked' : ''}`}>
                    <div className='flex gap-4 items-center card-checkbox-icon'>
                      {item.icon ? <div className='flex-none text-2xl'>
                        {item.icon}
                      </div> : ''}
                      <div className='flex-auto'>
                        <div className='card-checkbox-title'>{item.label}</div>
                        <div className='text-color-3'>{item.desc}</div>
                      </div>
                    </div>
                  </div>
                );
              }}
            </Radio>
          );
        })}
      </div>
    </Radio.Group>
  )
}
