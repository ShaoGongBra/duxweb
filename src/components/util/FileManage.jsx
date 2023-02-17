import { Modal, Select, Input, Empty, Spin, Pagination, Button, Progress } from '@arco-design/web-react'
import { IconClose, IconFolder, IconDelete, IconUpload } from '@arco-design/web-react/icon'
import { useCallback, useEffect, useState } from 'react'
import { QuickEvent, throttleRequest, upload } from '../../utils'

const api = {
  list: 'tools/fileManage?type=files',
  del: 'tools/fileManage?type=files-delete',
  cateList: 'tools/fileManage?type=folder',
  cateAdd: 'tools/fileManage?type=folder-create',
  cateDel: 'tools/fileManage?type=folder-delete'
}

export const FileManage = () => {

  const [show, setShow] = useState(true)

  const [progress, setProgress] = useState(0)

  const [cate, setCate] = useState([])

  const [typeOption, setTypeOption] = useState([])

  const [list, setList] = useState([])

  const [select, setSelect] = useState([])

  const [filter, setFilter] = useState({
    filter: 'all', // 类型
    keyword: '', // 搜索关键词
    id: '', // 分类id
    page: 1 // 分页
  })

  useEffect(() => {
    FileManage.event.open.on(data => {
      setShow(true)
    })
  }, [])

  useEffect(() => {
    setListLoading(true)
    throttleRequest({
      url: api.list,
      data: filter
    }).then(res => {
      setList(res.data)
      setPageTotal(res.total)
      setPageSize(res.pageSize)
    }).finally(() => {
      setListLoading(false)
    })
  }, [filter])

  const add = useCallback(() => {
    upload({
      multiple: true,
      getInfo: true
    }).progress(res => {
      setProgress(Math.trunc(res * 100))
    }).start(() => {
      setProgress(1)
    }).then(res => {
      setProgress(0)
    })
  }, [])

  const close = useCallback(() => {
    setShow(false)
    FileManage.event.back.trigger()
  }, [])

  const submit = useCallback(() => {

  }, [])

  const selectItem = useCallback(() => {

  }, [])

  const [cateAddValue, setCateAddValue] = useState('')
  const [cateAddStatus, setCateAddStatus] = useState(false)

  const delCate = useCallback(() => {

  }, [])

  const addCate = useCallback(() => {

  }, [])

  const [pageTotal, setPageTotal] = useState(0)
  const [pageSize, setPageSize] = useState(0)

  const [listLoading, setListLoading] = useState(false)

  const [isMultiple, setIsMultiple] = useState(false)

  return show && <Modal modalClass='file-manage page-dialog max-w-screen-md w-full' visible={show}
    closable={false} footer={false} onClose={close} onCancel={close}>

    <div className='arco-modal-header flex gap-2'>
      <div className='flex-grow flex flex-row gap-2'>
        <Button type='primary' icon={progress ? <Progress
          size='mini'
          percent={progress}
        /> : <IconUpload />} onClick={add}>
          点击上传
        </Button>
      </div>
      <div className='flex-none flex flex-row gap-2'>
        {typeOption.length > 1 && <div className='w-32'>
          <Select
            value={filter.filter}
            onChange={e => setFilter({ ...filter, filter: e })}
            options={typeOption}
          />
        </div>}
        <div className='w-32'>
          <Input
            value={filter.keyword}
            onChange={e => setFilter({ ...filter, keyword: e })}
            type='text'
            placeholder='搜索'
          />
        </div>
      </div>
      <div className='flex-none'>
        <div className='arco-icon-hover arco-icon-hover-size-medium' onClick={close}>
          <IconClose />
        </div>
      </div>
    </div>

    <div className='flex flex-row items-stretch  '>
      <div
        className='flex-none manage-sidebar w-40 border-r border-gray-300 dark:border-blackgray-2 h-96 overflow-y-auto block'>
        <ul>
          {
            cate.map((item, index) => <li
              key={index}
              className={`cate-item flex justify-between py-3 px-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-blackgray-2 dark:text-gray-400  ${filter.id === item.dir_id ? 'active text-blue-600 dark:text-blue-600' : ''}`}
              onClick={() => setFilter({ ...filter, id: item.dir_id })}
            >
              <div className='flex gap-2 items-center'>
                <IconFolder />
                {item.name}
              </div>
              <span className='del' onClick={e => {
                delCate(index)
              }}><IconDelete /></span>
            </li>)
          }
          <li className='p-3'>
            <Input
              className='add'
              value={cateAddValue}
              onChange={e => setCateAddValue(e)}
              onBlur={addCate}
              type='text'
              placeholder='添加新分类'
              loading={cateAddStatus}
            />
          </li>
        </ul>
      </div>
      <div className='flex-grow manage-main  dark:bg-blackgray-2 h-96 overflow-y-auto'>
        <Spin loading={listLoading} className='block' tip='载入文件中，请稍等...'>
          {list.length > 0 && <ul className='files-list grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-5 p-4'>
            {
              list.map(item => <li key={item.url} onClick={() => selectItem(item)}>
                <div
                  className={`item mb-1 mt-1 rounded p-2 text-gray-800 dark:text-gray-300 select-none cursor-pointer${isSelectItem(item) ? ' active bg-gray-100 text-blue-600 dark:bg-blackgray-3 dark:text-blue-600' : ''}`}
                  data-id='550'>
                  <div
                    className='h-20 rounded bg-cover bg-center bg-no-repeat rounded'
                    style={{ backgroundImage: `url(${item.url})` }}
                  >
                  </div>
                  <div className='mt-1'>
                    <div className='truncate'>{item.title}</div>
                    <div className='text-xs text-gray-500 truncate'>{item.time}</div>
                    <div className='text-xs text-gray-500 truncate'>{item.size}</div>
                  </div>
                </div>
              </li>)
            }
          </ul>}
          {pageTotal > 1 && <div className='flex justify-center py-2'><Pagination
            current={filter.page}
            onChange={e => setFilter({ ...filter, page: e })}
            total={pageTotal}
            pageSize={pageSize}
          /></div>}
          {list.length === 0 && <div className='flex flex-col justify-center items-center h-96'>
            <Empty />
          </div>}
        </Spin>
      </div>
    </div>
    {isMultiple && <div className='arco-modal-footer flex items-center gap-4 flex-row'>
      <c-scrollbar className='flex-grow' trigger='hover' direction='x'>
        <div className='flex gap-2 flex-nowrap flex-row flex-shrink-0'>
          {
            select.map(item => <div className='relative flex-shrink-0' key={item.file_id} onClick={() => selectItem(item)}>
              <img className='w-8 h-8 rounded' src={item.url} />
              <div
                className='absolute inset-0 bg-black bg-opacity-60 text-xs opacity-0  flex items-center justify-center text-white hover:opacity-100 select-none'>删除
              </div>
            </div>)
          }
        </div>
      </c-scrollbar>


      <div className='flex-none justify-end flex gap-2'>
        <Button onClick={close}>关闭</Button>
        <Button type='primary' onClick={submit}>确定</Button>
      </div>
    </div>}
  </Modal>
}

FileManage.event = {
  open: new QuickEvent(),
  back: new QuickEvent()
}

FileManage.select = (...rest) => {
  return new Promise((resolve, reject) => {
    FileManage.event.open.trigger(...rest)
    FileManage.event.back.on(value => value ? resolve(value) : reject('取消选择'))
  })
}