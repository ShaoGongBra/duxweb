import React from 'react'
import Scrollbar from './Scrollbar'

export default function Page({ header, footer, sideLeft, children }) {
  return (
    <div className='flex-auto overflow-auto lg:w-1 flex flex-col lg:flex-row lg:overflow-hidden'>
      {sideLeft ? <div className='p-4 pb-0 lg:pr-0'>{sideLeft}</div> : null}
      <Scrollbar className='flex-auto p-4  lg:w-1'>
        {header}
        {header ? <div className='mt-2'>{children}</div> : children}
        <div className='text-center p-4 text-color-4'>DuxWeb@1.0.0</div>
      </Scrollbar>
      {footer}
    </div>
  )
}
