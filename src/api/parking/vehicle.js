import request from '@/router/axios';

export const getSelectlist = (params) => {
  return request({
    url: '/api/iot-car/carshape/selectlist',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const getList = (params) => {
  return request({
    url: '/api/iot-car/carshape/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const getDetails = (params) => {
  return request({
    url: '/api/iot-car/carshape/details',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const add = (row) => {
  return request({
    url: '/api/iot-car/carshape/add',
    method: 'post',
    data:row
  })
}
export const update = (row) => {
  return request({
    url: '/api/iot-car/carshape/update',
    method: 'post',
    data:row
  })
}
export const remove = (row) => {
  return request({
    url: '/api/iot-car/carshape/remove',
    method: 'post',
    data:row
  })
}
