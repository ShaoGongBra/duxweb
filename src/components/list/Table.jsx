import React, { useEffect, useState, useImperativeHandle, forwardRef, useCallback, useMemo } from 'react'
import { request } from '../../utils'
import { Table as ArcoTable } from '@arco-design/web-react'

export const Table = forwardRef((
  {
    columns,
    url,
    urlParams,
    limit = 20,
    primaryKey = 'id',
    width = 1000,
    tableProps,
    onListData
  }, ref) => {

  const [data, setData] = useState([])

  const [pagination, setPagination] = useState({
    sizeCanChange: true,
    showTotal: true,
    total: 0,
    pageSize: limit,
    current: 1,
    pageSizeChangeResetCurrent: true,
    onChange: (current, pageSize) => {
      setPagination(old => ({ ...old, current, pageSize }))
    }
  })

  // 参数变化时重置为第一页
  useMemo(() => {
    setPagination(old => ({ ...old, current: 1 }))
  }, [url, urlParams])

  const [loading, setLoading] = useState(false)

  // 模拟远程请求
  const fetchData = useCallback(pageInfo => {
    setLoading(true)
    request({
      url,
      method: 'GET',
      data: { page: pageInfo.current, limit: pageInfo.pageSize, ...urlParams }
    })
      .then(res => {
        setTimeout(() => {
          setLoading(false)
        }, 500)
        setLoading(false)
        setData(res?.list || [])
        setPagination(old => ({ ...old, total: res.total || 0 }))
        onListData?.(res)
      })
      .catch(() => {
        setTimeout(() => {
          setLoading(false)
        }, 500)
        setData([])
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, urlParams])

  useEffect(() => {
    fetchData({ current: pagination.current, pageSize: pagination.pageSize })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, pagination.current, pagination.pageSize])

  useImperativeHandle(ref, () => {
    return {
      reload: () => fetchData({ current: pagination.current, pageSize: pagination.pageSize })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, pagination.current, pagination.pageSize])

  return (
    <ArcoTable
      key={data?.map(item => item[primaryKey]).join('') || '-1'}
      defaultExpandAllRows
      border={false}
      data={data}
      loading={loading}
      columns={columns}
      rowKey={primaryKey}
      pagination={pagination}
      scroll={{
        x: width
      }}
      {...tableProps}
    />
  )
})
