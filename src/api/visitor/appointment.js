import request from '@/router/axios';

export const getAppointmentList = (current, size, params) => {
  return request({
    url: '/api/iot-visitor/appointment/list',
    method: 'get',
    params: {
      current,
      size,
      ...params
    }
  })
}

export const blacklistAdd = (row) => {
  return request({
    url: '/api/iot-visitor/appointment/add/blacklist',
    method: 'post',
    data:row
  })
}
export const cancelState = (row) => {
  return request({
    url: '/api/iot-visitor/appointment/batch/visitor/cancel-state',
    method: 'post',
    data:row
  })
}