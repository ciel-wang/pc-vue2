import request from '@/router/axios';

export const holidayStatutory = () => {
  return request({
    url: '/api/iot-kq/holiday/statutory',
    method: 'get'
  })
}

export const holidayAdd = (row) => {
  return request({
    url: '/api/iot-kq/holiday/add',
    method: 'post',
    data:row
  })
}

export const holidayUpdate = (row) => {
  return request({
    url: '/api/iot-kq/holiday/update',
    method: 'post',
    data:row
  })
}

export const getHolidayList = (params) => {
  return request({
    url: '/api/iot-kq/holiday/list',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const holidaySingleUpdate = (row) => {
  return request({
    url: '/api/iot-kq/holiday/single/update',
    method: 'post',
    data: row
  })
}

export const holidayDetails = (params) => {
  return request({
    url: '/api/iot-kq/holiday/details',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const holidayRemove = (row) => {
  return request({
    url: '/api/iot-kq/holiday/remove',
    method: 'post',
    data:row
  })
}
