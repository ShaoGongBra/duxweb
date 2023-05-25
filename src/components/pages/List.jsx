import React, { useEffect, useState } from 'react'
import { Button, Input } from '@arco-design/web-react'
import { IconFilter } from '@arco-design/web-react/icon'
import Header from './Header'
import Page from './Page'
import { Filter, FilterList } from '../list'
import { Permission as DuxPermission } from '../../index'

const InputSearch = Input.Search

export default function PageList(
  {
    title, // 页面标题
    tabs, // 筛选切换
    menus, // 菜单栏
    search,
    tableData,
    filters, // 筛选元素
    defaultFilterData, // 筛选数据
    side, // 边栏
    permission, // 权限标记
    children,
    filterRender
  },
) {
  const [filterColl, setFilterColl] = useState(false)

  const [filterExtend, setFilterExtend] = useState(0)
  useEffect(() => {
    let extendNum = 0
    filters?.map?.((vo, key) => {
      if (vo.quick) {
        return;
      }
      extendNum++
    })
    setFilterExtend(extendNum)
  }, filters)

  const ContentPage = <Filter defaultData={defaultFilterData} bindUrl>
    {([filterData, filterAction]) => <Page
      header={
        <Header
          title={title}
          index={filterData.tab}
          menus={menus}
          tools={
            <>
              {search && (
                <Filter.Item field='keyword'>
                  {
                    itemFilter => <InputSearch
                      allowClear
                      value={itemFilter.value}
                      placeholder='请输入关键词进行搜索'
                      onChange={v => itemFilter.setValue('keyword', v)}
                      onPressEnter={itemFilter.submit}
                    />
                  }
                </Filter.Item>
              )}
              {
                filters?.map?.((vo, key) => {
                  if (!vo.quick) {
                    return
                  }
                  return <Filter.Item key={key}
                    field={vo?.name}>{typeof vo?.render === 'function' ? vo?.render({ tableData }) : vo?.render}</Filter.Item>
                })
              }

              {!!filterExtend && (
                <Button
                  type='outline'
                  icon={<IconFilter />}
                  onClick={() => {
                    setFilterColl(!filterColl)
                  }}
                >
                  筛选
                </Button>
              )}
            </>
          }
          tabs={tabs}
          onChange={tab => {
            filterAction.setValue('tab', tab)
            setTimeout(filterAction.submit, 0)
          }}
        />
      }

      sideLeft={side && <div className='lg:h-full'>{side}</div>}
    >
      {filterColl && (
        <div className='p-4 border border-gray-3 rounded bg-color-1 mb-2'>
          <FilterList items={filters?.filter(vo => {
            if (vo.quick) {
              return false;
            }
            return true;
          })} tableData={tableData} />
        </div>
      )}

      {filterRender && <div className='p-4 bg-color-1 rounded mb-2 border border-color-2'>
        {filterRender}
      </div>}

      <div className=' bg-color-1 rounded shadow-sm border border-color-2'>
        {typeof children === 'function' ? children([filterData, filterAction]) : children}
      </div>
    </Page>}
  </Filter>

  return (
    permission ? <DuxPermission mark={permission} page>{ContentPage}</DuxPermission> : ContentPage
  )
}
