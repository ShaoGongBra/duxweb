import React, { useEffect, useMemo } from 'react'
import { Button, Input, InputNumber, Switch, Table } from '@arco-design/web-react'
import { IconClose, IconDoubleDown, IconPlus } from '@arco-design/web-react/icon'
import { deepCopy } from '../../utils'

export const Spec = ({ fields, value, onChange }) => {

  const [spec, sku] = [value?.spec || [], value?.sku || []]

  const editData = (index, field, val) => {
    sku[index][field] = val
    onChange?.({
      spec,
      sku: [...sku]
    })
  }

  const [columns] = useMemo(() => {
    const specFilter = deepCopy(spec || []).map(item => {
      item.spec = item.spec.filter(v => v)
      if (!item.name || !item.spec.length) {
        return;
      }
      return item;
    }).filter(v => v)

    // 表格列
    const cols = []
    specFilter.map((item, index) => {
      cols.push({
        title: item.name,
        dataIndex: 'spec[' + index + ']',
      })
    })
    fields?.map(item => {
      cols.push({
        title: <div className='flex'>
          <div className='flex-auto'>{item.name}</div>
          <div><IconDoubleDown className='hover:cursor-pointer' onClick={() => {
            const value = sku[0][item.field]
            const tmp = [...sku]
            tmp.forEach(v => {
              v[item.field] = value
            })
            onChange?.({
              spec,
              sku: tmp
            })
          }} /></div>
        </div>,
        dataIndex: item.field,
        width: 120,
        render: (_, record, index) => {
          if (item.type === 'price') {
            return <InputNumber value={record[item.field]} onChange={v => {
              editData(index, item.field, v)
            }} step={0.01} precision={2} />
          }
          if (item.type === 'number') {
            return <InputNumber value={record[item.field]} onChange={v => {
              editData(index, item.field, v)
            }} />
          }
          if (item.type === 'text') {
            return <Input value={record[item.field]} onChange={v => {
              editData(index, item.field, v)
            }} />
          }
        },
      })
    })
    cols.push({
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (_, record, index) => {
        return <Switch checked={record.status} onChange={v => {
          editData(index, 'status', v)
        }} />
      }
    })

    return [cols]
  }, [spec])

  const specKey = JSON.stringify(spec)
  useEffect(() => {
    const specArray = deepCopy(spec || [])
      .map(item => {
        item.spec = item.spec.filter(v => v)
        if (!item.name || !item.spec.length) {
          return;
        }
        return item;
      })
      .filter(v => v)
      .map((item) => [...item.spec])
      .filter(item => item)

    const dataTmp = deepCopy(sku || [])
    const newData = []
    // console.log(specArray)
    specArray.reduce(
      (total, current) => {
        let ret = []
        total.forEach(a => {
          current.forEach(b => {
            ret.push(a.concat([b]))
          })
        })
        return ret
      },
      [[]]
    ).forEach((item, index) => {
      if (!dataTmp[index]) {
        dataTmp[index] = {
          key: index,
          status: true,
          id: 0,
          spec: item
        }
      } else {
        let keys = Object.keys(dataTmp[index])
        dataTmp[index].status = keys.includes('status') ? dataTmp[index].status : false
        dataTmp[index].id = keys.includes('id') ? dataTmp[index].id : 0
        dataTmp[index].spec = item
        dataTmp[index].key = index
      }
      let keys = Object.keys(dataTmp[index])
      fields?.forEach(field => {
        if (keys.includes(field.field)) {
          return
        }
        switch (field.type) {
        case 'price':
          dataTmp[index][field.field] = 0.00
          break
        case 'number':
          dataTmp[index][field.field] = 0
          break
        default:
          dataTmp[index][field.field] = ''
        }
      })
      newData.push(dataTmp[index])
    })
    onChange?.({
      spec,
      sku: newData
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specKey])

  return <div className='w-full'>
    <Button type='outline' onClick={() => {
      onChange?.({
        sku,
        spec: [...spec || [], {
          name: '',
          spec: []
        }]
      })
    }}>添加规格</Button>
    {spec?.map((item, index) => (<div key={index} className='border-1 border-gray-200  p-3 mt-3'>
      <div className='flex flex-wrap flex-col lg:flex-row gap-4 lg:items-center mb-4'>
        <div className='flex-none'>规格名</div>
        <div className='flex-grow flex flex-col lg:flex-row gap-4 lg:items-center'>
          <div>
            <Input
              style={{ width: '160px' }}
              value={item.name}
              onChange={(value) => {
                const tmp = [...spec]
                tmp[index].name = value
                onChange?.({
                  sku,
                  spec: tmp
                })
              }}
              suffix={<IconClose onClick={() => {
                const tmp = [...spec]
                tmp.splice(index, 1);
                onChange?.({
                  sku,
                  spec: tmp
                })
              }}
              />}
            />
          </div>
        </div>
      </div>
      <div className='flex flex-wrap flex-col lg:flex-row gap-4 lg:items-center'>
        <div className='flex-none'>规格值</div>
        <div className='flex-grow'>
          <div className='flex flex-wrap  flex-col lg:flex-row gap-2 lg:items-center'>
            {
              item?.spec?.map((v, i) => (<div key={i}>
                <Input
                  value={v}
                  onChange={(value) => {
                    const tmp = [...spec]
                    tmp[index].spec[i] = value
                    onChange?.({
                      sku,
                      spec: tmp
                    })
                  }}
                  style={{ width: '160px' }}
                  suffix={<IconClose onClick={() => {
                    const tmp = [...spec]
                    tmp[index].spec.splice(i, 1)
                    onChange?.({
                      sku,
                      spec: tmp
                    })
                  }}
                  />}
                />
              </div>))
            }
            <div>
              <div className='relative'>

                <Button type='outline' icon={<IconPlus />} onClick={() => {
                  const tmp = [...spec]
                  tmp[index].spec.push('')
                  onChange?.({
                    sku,
                    spec: tmp
                  })
                }}></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>))}
    <div className='mt-3'>
      <Table columns={columns} data={sku || []}
        scroll={{
          x: 1000,
        }}
        pagination={false} />
    </div>
  </div>
}
