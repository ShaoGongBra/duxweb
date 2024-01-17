import React, { useContext, useMemo, useState, Suspense } from 'react'
import { Modal } from '@arco-design/web-react'
import Draggable from 'react-draggable'
import { RouteManage, routeList, useRoute, route, } from '../../utils/route'
import { System } from '../../utils/system'

const EmptyPage = () => {
  return null
}

const ToPage = ({ state, type = 'page' }) => {
  const [pageKey, setPageKey] = useState(0)

  const Currnet = useMemo(() => {
    setPageKey(old => old + 1)

    return routeList[System.current + '/' + state?.path] // 用户页面
      || routeList.__global[state?.path] // 全局页面
      || EmptyPage
  }, [state])

  const value = useMemo(() => {
    return {
      state,
      type
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <RouteManage.Context.Provider value={value}>
      <Suspense fallback={<div></div>}>
        <Currnet key={pageKey} />
      </Suspense>
    </RouteManage.Context.Provider>
  )
}

const ModalItem = ({ item }) => {
  const [visible, setVisible] = useState(true)

  return (
    <Modal
      visible={visible}
      onClose={() => setVisible(false)}
      footer={null}
      modalRender={modal => <Draggable handle='.arco-modal-header'>{modal}</Draggable>}
      onCancel={route.closeModal}
      maskClosable={false}
      {...item.config}
      className={`route-modal max-w-full w-auto ${item.config?.className}`}
    >
      <ToPage state={item} type='modal' />
    </Modal>
  )
}

export default () => {
  const { currentState, modal } = useRoute()

  return (
    <>
      <ToPage state={currentState} />
      {modal.map(item => (
        <ModalItem key={item.key} item={item} />
      ))}
    </>
  )
}

export const Navigation = ({ children, type = 'push', url, data, onClick, ...props }) => {
  const { key } = useContext(RouteManage.Context)

  const nav = e => {
    RouteManage.getRoute(key)?.navigator[type](url, data)
    onClick?.(e)
  }

  return (
    <div onClick={nav} {...props}>
      {children}
    </div>
  )
}
