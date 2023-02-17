import * as qs from 'qs'
import { globalConfig } from '../../utils'

const PI = Math.PI
const x_pi = PI * 3000.0 / 180.0

const transformLat = (x, y) => {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
  return ret;
}
const transformLon = (x, y) => {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
  return ret;
}

const delta = (lat, lon) => {
  let a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
  let ee = 0.00669342162296594323; //  ee: 椭球的偏心率。
  let dLat = transformLat(lon - 105.0, lat - 35.0);
  let dLon = transformLon(lon - 105.0, lat - 35.0);
  let radLat = lat / 180.0 * PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  let sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI);
  dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI);
  return { lat: dLat, lon: dLon };
}

const outOfChina = (lat, lon) => {
  if (lon < 72.004 || lon > 137.8347)
    return true;
  if (lat < 0.8293 || lat > 55.8271)
    return true;
  return false;
}

/**
  WGS-84 GPS坐标
  GCJ-02 火星坐标
  BD-09 百度坐标
**/

//WGS-84 to GCJ-02
export const gcjEncrypt = (wgsLat, wgsLon) => {
  if (outOfChina(wgsLat, wgsLon))
    return { lat: wgsLat, lon: wgsLon };

  let d = delta(wgsLat, wgsLon);
  return { lat: wgsLat + d.lat, lon: wgsLon + d.lon };
}

//GCJ-02 to WGS-84
export const gcjDecrypt = (gcjLat, gcjLon) => {
  if (outOfChina(gcjLat, gcjLon))
    return { lat: gcjLat, lon: gcjLon };

  let d = delta(gcjLat, gcjLon);
  return { lat: gcjLat - d.lat, lon: gcjLon - d.lon };
}

//GCJ-02 to WGS-84 exactly
export const gcjDecryptExact = (gcjLat, gcjLon) => {
  let initDelta = 0.01;
  let threshold = 0.000000001;
  let dLat = initDelta, dLon = initDelta;
  let mLat = gcjLat - dLat, mLon = gcjLon - dLon;
  let pLat = gcjLat + dLat, pLon = gcjLon + dLon;
  let wgsLat, wgsLon, i = 0;
  while (1) {
    wgsLat = (mLat + pLat) / 2;
    wgsLon = (mLon + pLon) / 2;
    let tmp = gcjEncrypt(wgsLat, wgsLon)
    dLat = tmp.lat - gcjLat;
    dLon = tmp.lon - gcjLon;
    if ((Math.abs(dLat) < threshold) && (Math.abs(dLon) < threshold))
      break;

    if (dLat > 0) pLat = wgsLat; else mLat = wgsLat;
    if (dLon > 0) pLon = wgsLon; else mLon = wgsLon;

    if (++i > 10000) break;
  }
  return { lat: wgsLat, lon: wgsLon };
}

//GCJ-02 to BD-09
export const bdEncrypt = (gcjLat, gcjLon) => {
  let x = gcjLon, y = gcjLat;
  let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
  let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
  let bdLon = z * Math.cos(theta) + 0.0065;
  let bdLat = z * Math.sin(theta) + 0.006;
  return { lat: bdLat, lon: bdLon };
}

//BD-09 to GCJ-02
export const bdDecrypt = (bdLat, bdLon) => {
  let x = bdLon - 0.0065, y = bdLat - 0.006;
  let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
  let gcjLon = z * Math.cos(theta);
  let gcjLat = z * Math.sin(theta);
  return { lat: gcjLat, lon: gcjLon };
}

// 计算两点之间的距离
export const distance = (latA, lonA, latB, lonB) => {
  let earthR = 6371000.;
  let x = Math.cos(latA * PI / 180.) * Math.cos(latB * PI / 180.) * Math.cos((lonA - lonB) * PI / 180);
  let y = Math.sin(latA * PI / 180.) * Math.sin(latB * PI / 180.);
  let s = x + y;
  if (s > 1) s = 1;
  if (s < -1) s = -1;
  let alpha = Math.acos(s);
  return alpha * earthR;
}


/**
 * 获取用户当前经纬度 返回火星坐标
 * 如果定位失败会返回错误
 */
export const getLocationBase = (enableHighAccuracy = false) => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { lat, lon } = gcjEncrypt(position.coords.latitude, position.coords.longitude)
          resolve({ longitude: lon, latitude: lat })
        },
        err => reject({ message: '浏览器定位失败', errMsg: err })
        , {
          timeout: 15000,
          ...(enableHighAccuracy ? { maximumAge: 5000 } : {}),
          enableHighAccuracy
        })
    } else {
      reject({ message: '当前浏览器暂不支持获取定位' })
    }
  })
}

export const amapRequest = async (url, data) => {
  const res = await fetch('https://restapi.amap.com/v3/' + url + '?' + qs.stringify({
    key: globalConfig.getConfig(data => data.duxweb.map.apiKey),
    ...data
  }))
  if (res.status === 200) {
    const body = await res.json()
    if (body.status === '1') {
      return body
    }
    throw body
  } else {
    throw res.data
  }
}

/**
 * 地址解析 通过地址信息获得经纬度
 * @param {string} address 地址信息
 */
export const getGeocode = async address => {
  const res = await amapRequest('geocode/geo', {
    address
  })
  const item = res.geocodes[0]
  return {
    province: item.province,
    city: item.city,
    code: item.adcode,
    longitude: Number(item.location.split(',')[0]),
    latitude: Number(item.location.split(',')[1])
  }
}

/**
 * 逆地址解析 通过经纬度信息获得地址信息
 * @param {string} longitude 精度
 * @param {string} latitude 纬度
 * @param {boolean} isPoi 是否用pio信息替代地址信息
 */
export const getRegeo = async (longitude, latitude, isPoi = false) => {
  const res = await amapRequest('geocode/regeo', {
    location: longitude + ',' + latitude,
    extensions: 'all',
    radius: 100,
    roadlevel: 0
  })
  const item = res.regeocode.addressComponent
  const name = res.regeocode.formatted_address
  const add = `${item.province}${item.city}${item.district}${item.township}`
  const poi = res.regeocode.pois.map(poiItem => ({ distance: Number(poiItem.distance), name: poiItem.name })).sort((a, b) => a.distance - b.distance)[0]
  const data = {
    ...item,
    code: item.adcode,
    addname: name.substr(name.indexOf(add) + add.length) || name,
    longitude,
    latitude
  }
  if (isPoi && poi && Number(poi.distance) <= 100) {
    data.addname = poi.name
  }
  return data
}


/**
 * 解析最近的pio信息
 * @param {*} longitude
 * @param {*} latitude
 */
export const getPoi = async (longitude, latitude) => {
  const types = (() => {
    const typesArr = []
    for (let i = 1; i <= 15; i++) {
      typesArr.push((i < 10 ? '0' + i : i) + '0000')
    }
    return typesArr.join('|')
  })()
  const res = await amapRequest('place/around', {
    location: longitude + ',' + latitude,
    radius: 100,
    types: types
  })
  const item = res.pois[0]
  if (!item) {
    return getRegeo(longitude, latitude)
  }
  const location = item.location.split(',').map(e => Number(e))
  return {
    adcode: item.adcode,
    address: item.address,
    addname: item.name,
    city: item.cityname,
    citycode: item.citycode,
    code: item.pcode,
    country: '中国',
    district: item.adname,
    latitude: location[1],
    longitude: location[0],
    province: item.pname,
    towncode: item.gridcode,
    township: ''
  }
}

/**
 * 获取周边地址列表
 * @param {*} lat
 * @param {*} lng
 */
export const getAround = async (lat, lng) => {
  let latitude = lat
  let longitude = lng
  if (!latitude || !longitude) {
    const { latitude: _latitude, longitude: _longitude } = await getLocationBase()
    latitude = _latitude
    longitude = _longitude
  }
  const types = (() => {
    const typesArr = []
    for (let i = 1; i <= 15; i++) {
      typesArr.push((i < 10 ? '0' + i : i) + '0000')
    }
    return typesArr.join('|')
  })()
  const res = await amapRequest('place/around', {
    location: longitude + ',' + latitude,
    radius: 300,
    types: types
  })
  let list = []
  for (let i = 0; i < res.pois.length; i++) {
    const item = res.pois[i];
    const location = item.location.split(',')
    list.push({
      longitude: location[0],
      latitude: location[1],
      adcode: item.adcode,
      address: item.address,
      addname: item.name,
      city: item.cityname,
      citycode: item.citycode,
      code: item.pcode,
      country: '中国',
      district: item.adname,
      province: item.pname,
      towncode: item.gridcode,
      township: ''
    })
  }
  return list
}