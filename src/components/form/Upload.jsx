import React, { useState, useMemo, useEffect , useCallback } from 'react'
import { Progress, Image, Button, Table, Link } from '@arco-design/web-react'
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { upload } from '../../utils'
import {
  IconArrowDown,
  IconArrowUp,
  IconDelete,
  IconEdit,
  IconEye,
  IconPlus,
  IconUpload
} from '@arco-design/web-react/icon'


const ImageProgress = ({ rate }) => {
  return <Progress
    percent={rate}
    type='circle'
    size='mini'
    style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translateX(-50%) translateY(-50%)',
    }}
  />
}

export function UploadImages({
  value,
  onChange,
  capture,
  children,
  width,
  height,
  mode,
  quality,
  logo,
  logoPosition,
  max = 9,
  size= [20,20], // 展示大小
}) {

  useEffect(() => {
    if (!value) {
      onChange?.([])
    }
  }, [onChange, value])

  const [progress, setProgress] = useState(0)

  const uploadFile = ({ multiple } = {}) => {
    return upload({
      capture,
      accept: 'image/*',
      isImage: true,
      multiple: multiple ?? max > 1,
      width,
      height,
      mode,
      quality,
      logo,
      logoPosition,
    })
  }

  const del = index => {
    value.splice(index, 1)
    onChange?.([...value])
  }

  const add = index => {
    uploadFile({ multiple: false }).progress(res => {
      let num = Math.trunc(res * 100)
      setProgress(num)
    }).start(() => {
      setProgress(1)
    }).then(res => {
      if (index > -1) {
        value.splice(index, 1, res[0])
      } else {
        value = [...value, ...res]
      }
      onChange?.([...value])
      setProgress(0)
    })
  }
  const [visible, setVisible] = useState(false);

  return <div className='flex flex-wrap gap-2'>
    {
      typeof children === 'function'
        ? children(value)
        : children
          ? children
          : <>
            {
              value?.map?.((img, i) => (
                <div key={i} className={`bg-gray-2 border border-color-2 rounded-sm w-full lg:w-${size[0]} h-${size[1]} text-center relative overflow-hidden`}>
                  <Image src={img} className='w-full' width='100%' previewProps={{
                    visible,
                    onVisibleChange: () => {
                      setVisible(false);
                    },
                  }} />
                  {!progress && <div className='arco-upload-list-item-picture-mask'>
                    <div className=' flex items-center justify-center gap-2 w-full h-full'>
                      <IconEye onClick={() => setVisible(true)} />
                      <IconEdit onClick={() => add(i)} />
                      <IconDelete onClick={() => del(i)} />
                    </div>
                  </div>}
                  {(max === 1 && progress > 0 && progress < 100) && <ImageProgress rate={progress} />}
                </div>
              ))
            }
            {value?.length < max && <div className={`bg-gray-2 border border-color-3 hover:bg-gray-3 cursor-pointer rounded-sm border-dotted w-full lg:w-${size[0]} h-${size[1]} text-center relative`} onClick={() => {
              !progress && add(-1)
            }}>
              <div className='arco-upload-trigger-picture-text'>
                <IconPlus />
              </div>
              {(progress > 0 && progress < 100) && <ImageProgress rate={progress} />}
            </div>}
          </>
    }
  </div>
}

export function UploadImage({
  value,
  onChange,
  children,
  ...props
}) {
  const change = _value => {
    onChange?.(_value[0] || '')
  }
  const val = useMemo(() => value ? [value] : [], [value])

  return <UploadImages {...props} onChange={change} max={1} value={val}>
    {children}
  </UploadImages>
}

const getFilesize = (size) => {
  if (!size) return '';
  let num = 1024.00; //byte
  if (size < num)
    return size + 'B';
  if (size < Math.pow(num, 2))
    return (size / num).toFixed(2) + 'KB'; //kb
  if (size < Math.pow(num, 3))
    return (size / Math.pow(num, 2)).toFixed(2) + 'MB'; //M
  if (size < Math.pow(num, 4))
    return (size / Math.pow(num, 3)).toFixed(2) + 'G'; //G
  return (size / Math.pow(num, 4)).toFixed(2) + 'T'; //T
}

export function UploadFiles({
  value,
  onChange,
  children,
  accept,
  max = 9
}) {

  useEffect(() => {
    if (!value) {
      onChange?.([])
    }
  }, [onChange, value])

  const [progress, setProgress] = useState(0)

  const uploadFile = ({ multiple } = {}) => {
    return upload({
      accept,
      multiple: multiple ?? max > 1,
      getInfo: true
    })
  }

  const del = useCallback(index => {
    value.splice(index, 1)
    onChange?.([...value])
  }, [onChange, value])

  const add = () => {
    uploadFile().progress(res => {
      setProgress(Math.trunc(res * 100))
    }).start(() => {
      setProgress(1)
    }).then(res => {
      onChange?.([...value, ...res].map((item, index) => {
        item.key = index
        return item
      }))
      setProgress(0)
    })
  }

  const sort = useCallback((index, type) => {
    const del = value.splice(index, 1)
    value.splice(type ? index + 1 : index - 1, 0, ...del)

    onChange?.(value.map((item, index) => {
      item.key = index
      return item
    }))
  }, [onChange, value])

  const columns = useMemo(() => {
    return [
      {
        dataIndex: 'name',
        title: '文件名',
        render: (_, record) => (
          <Link onClick={() => {
            window.open(record.url)
          }}>{record.name}</Link>
        ),
      },
      {
        dataIndex: 'size',
        width: 150,
        title: '文件大小',
        render: (_, record) => getFilesize(record.size)
      },
      {
        title: '操作',
        width: 150,
        render: (index, record) => (
          <>
            <Link disabled={record.key === 0} onClick={() => {
              sort(record.key, 0)
            }}>上移</Link>
            <Link disabled={record.key === value?.length - 1} onClick={() => {
              sort(record.key, 1)
            }}>下移</Link>
            <Link onClick={() => {
              del(record.key)
            }}>删除</Link>
          </>
        ),
      },
    ]
  }, [del, sort, value?.length])


  return <div className='flex flex-col gap-2'>
    {
      typeof children === 'function'
        ? children(value)
        : children
          ? children
          : <>
            <div>
              <Button type='primary' icon={progress ?  <Progress
                size='mini'
                percent={progress}
              /> : <IconUpload />} onClick={add}>
                点击上传
              </Button>
            </div>
            <div>
              <Table rowKey='key' columns={columns} data={value} />
            </div>
          </>
    }
  </div>
}

export function UploadFile({
  value = {},
  onChange,
  accept,
  children,
}) {

  useEffect(() => {
    if (!value) {
      onChange?.({})
    }
  }, [onChange, value])

  const [progress, setProgress] = useState(0)

  const uploadFile = ({ multiple } = {}) => {
    return upload({
      accept,
      multiple: false,
      getInfo: true
    })
  }

  const del = useCallback(index => {
    onChange?.({})
  }, [onChange, value])

  const add = () => {
    uploadFile().progress(res => {
      setProgress(Math.trunc(res * 100))
    }).start(() => {
      setProgress(1)
    }).then(res => {
      onChange?.(res[0])
      setProgress(0)
    })
  }


  return <div className='flex flex-col gap-2'>
    {
      typeof children === 'function'
        ? children(value)
        : children
          ? children
          : <>
            <div className='lg:w-100 bg-gray-2 h-40 border-dashed border-color-3 rounded flex items-center justify-center'>
              <div className='flex flex-col gap-4 justify-center items-center'>
                {progress ? <Progress
                  type='circle'
                  size='small'
                  percent={progress}
                  status='success'
                /> : <>
                  {value?.url ? <>
                    <div className='text-center'>
                      <div className='text-title-1'>{value.name}</div>
                      <div className='text-color-3'>{getFilesize(value.size)}</div>
                    </div>
                    <div className='flex gap-2'>
                      <Button icon={<IconUpload />} type='outline' onClick={add}>
                        重新上传
                      </Button>
                      <Button icon={<IconDelete />} type='outline' status='danger' onClick={del}>
                        删除
                      </Button>
                    </div>
                  </>: <>
                    <div className='text-center'>
                      <div className='text-color-3'>暂无上传文件</div>
                    </div>
                    <Button icon={<IconUpload />} type='outline' onClick={add}>
                      点击上传
                    </Button>
                  </>}
                </>}
              </div>
            </div>
          </>
    }
  </div>
}

export function UploadVedios({
  value,
  onChange,
  capture,
  children,
  width,
  height,
  mode,
  quality,
  logo,
  logoPosition,
  max = 9,
  size= [20,20], // 展示大小
}) {

  useEffect(() => {
    if (!value) {
      onChange?.([])
    }
  }, [onChange, value])

  const [progress, setProgress] = useState(0)

  const uploadFile = ({ multiple } = {}) => {
    return upload({
      capture,
      accept:'video/*',
      multiple: multiple ?? max > 1,
      width,
      height,
      mode,
      quality,
      logo,
      logoPosition,
    })
  }

  const del = index => {
    value.splice(index, 1)
    onChange?.([...value])
  }

  const add = index => {
    uploadFile({ multiple: false }).progress(res => {
      let num = Math.trunc(res * 100)
      setProgress(num)
    }).start(() => {
      setProgress(1)
    }).then(res => {
      if (index > -1) {
        value.splice(index, 1, res[0])
      } else {
        value = [...value, ...res]
      }
      onChange?.([...value])
      setProgress(0)
    })
  }

  return <div className='flex flex-wrap gap-2'>
  {
    typeof children === 'function'
      ? children(value)
      : children
        ? children
        : <>
          {
            value?.map?.((img, i) => (
              <div key={i} className={`bg-gray-2 border border-color-2 rounded-sm w-full lg:w-${size[0]} h-${size[1]} text-center relative overflow-hidden`}>
                <video src={img} className='w-full h-full' ></video>
                {!progress && <div className='arco-upload-list-item-picture-mask'>
                  <div className=' flex items-center justify-center gap-2 w-full h-full'>
                    <IconEdit onClick={() => add(i)} />
                    <IconDelete onClick={() => del(i)} />
                  </div>
                </div>}
                {(max === 1 && progress > 0 && progress < 100) && <ImageProgress rate={progress} />}
              </div>
            ))
          }
          {value?.length < max && <div className={`bg-gray-2 border border-color-3 hover:bg-gray-3 cursor-pointer rounded-sm border-dotted w-full lg:w-${size[0]} h-${size[1]} text-center relative`} onClick={() => {
            !progress && add(-1)
          }}>
            <div className='arco-upload-trigger-picture-text'>
              <IconPlus />
            </div>
            {(progress > 0 && progress < 100) && <ImageProgress rate={progress} />}
          </div>}
        </>
  }
</div>
}


export function UploadVedio({
  value,
  onChange,
  children,
  ...props
}) {
  const change = _value => {
    onChange?.(_value[0] || '')
  }
  const val = useMemo(() => value ? [value] : [], [value])

  return <UploadVedios {...props} onChange={change} max={1} value={val}>
    {children}
  </UploadVedios>
}