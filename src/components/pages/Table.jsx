import React, { forwardRef, useImperativeHandle, useRef, useState, useMemo } from 'react'
import { PageList, Table as DuxTable } from '../../index'

export default forwardRef(({
  title, // 页面标题
  tabs, // 筛选切换
  menus, // 菜单栏
  search,
  filters, // 筛选元素
  defaultFilterData, // 筛选数据
  side, // 边栏
  columns, // 列配置
  url, // 数据地址
  data, // 数据
  limit = 20, // 每页数量
  primaryKey = 'id',
  width = 1000,
  height,
  permission, // 权限标记
  tableProps,
  dataCallBack, // 数据回调
  filterRender,
  header,
  sortData,
  bindUrl
}, ref) => {

  const table = useRef(null)
  useImperativeHandle(
    ref,
    () => ({
      reload: () => table.current.reload(),
    }),
    []
  )



  const [tableData, setTableDat] = useState({})

  return (
    <PageList
      title={title}
      tabs={tabs}
      menus={menus}
      search={search}
      tableData={tableData}
      filters={filters}
      defaultFilterData={defaultFilterData}
      side={side}
      permission={permission}
      filterRender={filterRender}
      header={header}
      bindUrl={bindUrl}
    >
      {([filterData]) => {
        const requestData = useMemo(() => {
          return { ...filterData, ...sortData }
        }, [filterData, sortData])
        return <DuxTable
          ref={table}
          columns={columns}
          url={url}
          urlParams={requestData}
          data={data}
          limit={limit}
          primaryKey={primaryKey}
          width={width}
          height={height}
          tableProps={tableProps}
          onListData={(e) => {
            setTableDat(e)
            dataCallBack?.(e)
          }}
        />
      }}
    </PageList>
  )
}
)
