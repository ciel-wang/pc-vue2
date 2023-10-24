import request from '@/router/axios';

export const reqIndexStatic = (params) => {
  return request({
    url: '/api/iot-car/home/statistics/index',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const getParkingList = (params) => {
  return request({
    url: '/api/iot-car/parking/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const addParking = (row) => {
  return request({
    url: '/api/iot-car/parking/add',
    method: 'post',
    data:row
  })
}
export const updateParking = (row) => {
  return request({
    url: '/api/iot-car/parking/update',
    method: 'post',
    data:row
  })
}
export const removeParking = (row) => {
  return request({
    url: '/api/iot-car/parking/remove',
    method: 'post',
    data:row
  })
}