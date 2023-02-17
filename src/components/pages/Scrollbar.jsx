import React from 'react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

export default function Scrollbar({ children, className }) {
  return (
    <OverlayScrollbarsComponent defer className={`${className}`} options={{ scrollbars: { autoHide: 'scroll' } }}>
      {children}
    </OverlayScrollbarsComponent>
  )
}
