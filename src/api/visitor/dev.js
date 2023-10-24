import request from '@/router/axios';


export const getDevList = (current, size, params) => {
  return request({
    url: '/api/iot-visitor/dev/list',
    method: 'get',
    params: {
      current,
      size,
      ...params
    }
  })
}

export const addDev = (row) => {
  return request({
    url: '/api/iot-visitor/dev/add',
    method: 'post',
    data:row
  })
}

export const removeDev = (ids) => {
  return request({
    url: '/api/iot-visitor/dev/delete',
    method: 'post',
    data:ids
  })
}

export const updateDev = (row) => {
  return request({
    url: '/api/iot-visitor/dev/update',
    method: 'post',
    data:row
  })
}
