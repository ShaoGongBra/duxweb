import { Map as AMap, APILoader, Marker } from '@uiw/react-amap'
import { useCallback, useRef, useState, useEffect } from 'react'
import { Input, List, Avatar } from '@arco-design/web-react'
import { globalConfig, useDocSize } from '../../utils'
import { getLocationBase, getRegeo, amapRequest } from './mapUtil'

export const MapView = ({
  onMoveEnd,
  center,
  zoom = 18,
  markers
}) => {

  const map = useRef()

  const key = globalConfig.getConfig(data => data.duxweb.map.key)

  const mapChange = useCallback(() => {
    const _center = map.current.map.getCenter()
    onMoveEnd?.({ center: [_center.lng, _center.lat] })
  }, [onMoveEnd])

  return <APILoader akay={key}>
    <AMap
      ref={map}
      center={center}
      zoom={zoom}
      onDragEnd={mapChange}
      onZoomEnd={mapChange}
      onComplete={mapChange}
      className='absolute left-0 right-0 top-0 right-0'
    >
      {
        markers?.map(marker => <Marker
          key={'' + marker.longitude + marker.lat}
          position={[marker.longitude, marker.lat]}
        />)
      }
    </AMap>
  </APILoader>
}

export const MapSelect = ({
  value,
  onChange,
  disabled
}) => {

  const [list, setList] = useState([])

  const [center, setCenter] = useState(void 0)

  const [location, setLocation] = useState({
    city: '',
    longitude: 112.9443499753422,
    latitude: 28.224492580346134
  })

  useEffect(() => {
    if (value?.location && value?.longitude) {
      setCenter([+value.longitude, +value.location])
      setLocation({ city: '', longitude: +value.longitude, latitude: +value.location })
    } else {
      // 定位获取当前位置
      getLocationBase().then(res => {
        mapChange({center: [res.longitude,res.latitude]})
        setCenter([res.longitude, res.latitude])
        setLocation({ city: '', longitude: res.longitude, latitude: res.latitude })
      }).catch(err => {
        console.log('获取当前位置失败',err)
      })
    }
  }, [value?.location, value?.longitude])

  const search = useCallback(e => {
    const types = (() => {
      const typesArr = []
      for (let i = 1; i <= 19; i++) {
        typesArr.push((i < 10 ? '0' + i : i) + '0000')
      }
      return typesArr.join('|')
    })()
    amapRequest('place/text', {
      keywords: e,
      city: location.city,
      location: `${location.longitude},${location.latitude}`,
      // radius: 10000,
      extensions: 'all',
      offset: 25,
      types,
      citylimit: true
    }).then(res => {
      setList(res.pois.map(item => ({
        province: item.pname,
        city: item.cityname,
        district: item.adname,
        address: item.address,
        name: item.name,
        longitude: +item.location.split(',')[0],
        location: +item.location.split(',')[1]
      })))
    })
  }, [location.city, location.latitude, location.longitude])

  const mapChange = useCallback(res => {
    getRegeo(res.center[0], res.center[1], true).then(res => {
      const info = {
        province: res.province,
        city: res.city,
        district: res.district,
        address: res.addname,
        name: '',
        longitude: +res.longitude,
        location: +res.latitude
      }
      onChange?.(info)
    })
  }, [onChange])

  const selectItem = useCallback(item => {
    onChange?.(item)
    setCenter([item.longitude, item.location])
  }, [onChange])

  const [size, sizeEmit] = useDocSize()

  return <div className='flex items-stretch' style={{ flexDirection: size < sizeEmit.md ? 'column' : 'row' }}>
    <div className='relative flex-grow min-h-100'>
      <MapView
        center={center}
        onMoveEnd={mapChange}
      />
      <div style={{ transform: 'translate3d(-50%, -100%, 0)' }} className='absolute left-50% top-50% flex flex-col items-center'>
        <div className='w-8 h-8 rd-4 bg-rose' />
        <div className='w-2px h-8 bg-rose' />
      </div>

      <div className='absolute bottom-6 w-full flex justify-center'>
        <div className='bg-white p-2 rd-2'>当前位置: {value?.province}{value?.city}{value?.district}{value?.address}</div>
      </div>
    </div>
    <div style={{ width: size < sizeEmit.md ? '100%' : '20rem' }}>
      <Input.Search placeholder='请输入关键词搜索' onSearch={search} />
      <List
        dataSource={list}
        className='bg-white max-h-100 mt-1'
        render={(item, index) => (
          <List.Item key={index} onClick={() => selectItem(item)}>
            <List.Item.Meta
              avatar={<Avatar shape='circle'>{index + 1}</Avatar>}
              title={item.name}
              description={`${item.province}${item.city}${item.district}${item.address}`}
            />
          </List.Item>
        )}
      />
    </div>
  </div>
}
