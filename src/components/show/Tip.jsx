import React, { useState } from 'react'
import {Descriptions, Image, Popover, Tag} from '@arco-design/web-react';
import {request} from '../../utils';

export function Tip({children, url}) {

  const [info, setInfo] = useState({})
  return (
    <Popover
      trigger='click'

      onVisibleChange={() => {
        request({
          url: url,
          method: 'GET'
        }).then(res => {
          setInfo(res)
        })
      }}
      content={
        <div className='w-60 flex flex-col gap-4'>
          <div className='flex gap-4 items-center'>
            <div>
              <Image
                width={60}
                height={60}
                src={info.image}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <div className='flex gap-2 text-color-1'>{info.title}
              </div>
              <div className='text-color-3'>
                <div>{info.desc}</div>
              </div>
            </div>
          </div>
          <div>
            {info?.labels?.map((item, index) => (
              <Tag color={item.color} key={index}>
                {item.value}
              </Tag>
            ))}
          </div>
          <div>
            <Descriptions
              size='small'
              column={1}
              data={info?.list}
            />
          </div>
        </div>
      }
    >
      <div className='text-primary-7 cursor-pointer'>{children}</div>
    </Popover>
  )
}
