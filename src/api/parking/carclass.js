import request from '@/router/axios';

export const getDictCode = (params) => {
  return request({
    url: '/api/iot-basic/dict/code',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const getCartypeList = (params) => {
  return request({
    url: '/api/iot-car/cartype/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const addCartype = (row) => {
  return request({
    url: '/api/iot-car/cartype/add',
    method: 'post',
    data:row
  })
}
export const detailsCartype = (params) => {
  return request({
    url: '/api/iot-car/cartype/details',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const updateCartype = (row) => {
  return request({
    url: '/api/iot-car/cartype/update',
    method: 'post',
    data:row
  })
}
export const removeCartype = (row) => {
  return request({
    url: '/api/iot-car/cartype/remove',
    method: 'post',
    data:row
  })
}
