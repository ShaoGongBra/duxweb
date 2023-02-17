import React from 'react'
import {Avatar} from '@arco-design/web-react';
import {IconUser} from '@arco-design/web-react/icon';


export function MediaImageText({avatar, name, desc, size, icon, shape = 'circle'}) {
  return (
    <div className='flex gap-2 py-2 items-center leading-5'>
      <div className='flex-none' >
        <Avatar style={{ backgroundColor: '#3370ff' }} size={size} shape={shape}>
          {avatar ? <img src={avatar}/> : (icon || <IconUser />)}
        </Avatar>
      </div>
      <div className='flex-grow '>
        <div className='text-color-1'>{name}</div>
        <div className='text-color-3'>{desc}</div>
      </div>
    </div>
  )
}