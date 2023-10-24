import request from '@/router/axios';

export const getClassestimeList = (params) => {
  return request({
    url: '/api/iot-kq/classestime/list',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const classestimeAdd = (row) => {
  return request({
    url: '/api/iot-kq/classestime/add',
    method: 'post',
    data:row
  })
}

export const classestimeDetails = (params) => {
  return request({
    url: '/api/iot-kq/classestime/details',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const classestimeUpdate = (row) => {
  return request({
    url: '/api/iot-kq/classestime/update',
    method: 'post',
    data: row
  })
}

export const classestimeRemove = (row) => {
  return request({
    url: '/api/iot-kq/classestime/remove',
    method: 'post',
    data:row
  })
}
