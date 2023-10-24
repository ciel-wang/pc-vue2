import request from '@/router/axios';

export const getVisitorList = (current, size, params) => {
  return request({
    url: '/api/iot-visitor/appointment/visitor/list',
    method: 'get',
    params: {
      current,
      size,
      ...params
    }
  })
}

export const visitorExport = (current, size, params) => {
  return request({
    url: '/api/iot-visitor/appointment/visitor/export',
    method: 'get',
    params: {
      current,
      size,
      ...params
    }
  })
}

export const levelRemove = (row) => {
  return request({
    url: '/api/iot-visitor/appointment/batch/visitor/leave',
    method: 'post',
    data:row
  })

}

export const cancelAuth = (row) => {
  return request({
    url: '/api/iot-visitor/appointment/batch/cancel/visitor/auth',
    method: 'post',
    data:row
  })
}

export const downAuth = (row) => {
  return request({
    url: '/api/iot-visitor/appointment/batch/down/visitor/auth',
    method: 'post',
    data:row
  })
}

export const eventList = (current, size, params) => {
  return request({
    url: '/api/iot-visitor/event/list',
    method: 'get',
    params: {
      current,
      size,
      ...params
    }
  })
}

export const devauthList = (current, size, params) => {
  return request({
    url: '/api/iot-visitor/event/visitor/devauth/list',
    method: 'get',
    params: {
      current,
      size,
      ...params
    }
  })
}
