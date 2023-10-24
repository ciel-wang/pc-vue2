import request from '@/router/axios';

export const getAreaZtreeData = (params) => {
  return request({
    url: '/api/iot-car/parking/area/tree',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const getAreaSelectDic = (params) => {
  return request({
    url: '/api/iot-car/parking/area/selectlist',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const getDevZtreeData = (params) => {
  return request({
    url: '/api/iot-car/parking/tree',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const getAreaList = (params) => {
  return request({
    url: '/api/iot-car/parking/area/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const getAreaDetails = (params) => {
  return request({
    url: '/api/iot-car/parking/area/details',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const addArea = (row) => {
  return request({
    url: '/api/iot-car/parking/area/add',
    method: 'post',
    data:row
  })
}
export const updateArea = (row) => {
  return request({
    url: '/api/iot-car/parking/area/update',
    method: 'post',
    data:row
  })
}
export const removeArea = (row) => {
  return request({
    url: '/api/iot-car/parking/area/remove',
    method: 'post',
    data:row
  })
}
export const getParkingArea = (params) => {
  return request({
    url: '/api/iot-car/parking/area/select/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
