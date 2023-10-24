import request from '@/router/axios';

export const getSentryList = (params) => {
  return request({
    url: '/api/iot-car/sentry/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const addSentry = (row) => {
  return request({
    url: '/api/iot-car/sentry/add',
    method: 'post',
    data:row
  })
}
export const detailsSentry = (params) => {
  return request({
    url: '/api/iot-car/sentry/details',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const updateSentry = (row) => {
  return request({
    url: '/api/iot-car/sentry/update',
    method: 'post',
    data:row
  })
}
export const removeSentry = (row) => {
  return request({
    url: '/api/iot-car/sentry/remove',
    method: 'post',
    data:row
  })
}
export const getChannelList = (params) => {
  return request({
    url: '/api/iot-car/channel/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const addChannel = (row) => {
  return request({
    url: '/api/iot-car/channel/add',
    method: 'post',
    data:row
  })
}
export const detailsChannel = (params) => {
  return request({
    url: '/api/iot-car/channel/details',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const updateChannel = (row) => {
  return request({
    url: '/api/iot-car/channel/update',
    method: 'post',
    data:row
  })
}
export const removeChannel = (row) => {
  return request({
    url: '/api/iot-car/channel/remove',
    method: 'post',
    data:row
  })
}
export const getDevList = (params) => {
  return request({
    url: '/api/iot-car/dev/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const addDev = (row) => {
  return request({
    url: '/api/iot-car/dev/add',
    method: 'post',
    data:row
  })
}
export const detailsDev = (params) => {
  return request({
    url: '/api/iot-car/dev/details',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const updateDev = (row) => {
  return request({
    url: '/api/iot-car/dev/update',
    method: 'post',
    data:row
  })
}
export const removeDev = (row) => {
  return request({
    url: '/api/iot-car/dev/remove',
    method: 'post',
    data:row
  })
}
