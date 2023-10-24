import request from '@/router/axios';

export const visitorAllotSubmit = (row) => {
  return request({
    url: '/api/iot-dorm/live/visitor/allot',
    method: 'post',
    data:row
  })
}
export const apartmentCheckout = (row) => {
  return request({
    url: '/api/iot-dorm/live/apartment/exit',
    method: 'post',
    data:row
  })
}
export const apartmentExchange = (row) => {
  return request({
    url: '/api/iot-dorm/live/apartment/exchange',
    method: 'post',
    data:row
  })
}
export const getDormVisitorData = (params) => {
  return request({
    url: '/api/iot-dorm/live/apartment/visitorlist',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getApartmentStatistics = () => {
  return request({
    url: '/api/iot-dorm/dorm/apartment/statistics',
    method: 'get',
  })
}
export const getApartmentExchange = (params) => {
  return request({
    url: '/api/iot-dorm/log/apartment/exchange/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getApartmentLive = (params) => {
  return request({
    url: '/api/iot-dorm/live/apartment/visitor/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getExitDetalisList = (row) => {
  return request({
    url: '/api/iot-dorm/live/apartment/exit/liveinfo',
    method: 'post',
    data:row
  })
}
export const accountSubmit = (row) => {
  return request({
    url: '/api/iot-dorm/live/apartment/exit',
    method: 'post',
    data:row
  })
}
export const mjauthDown = (row) => {
  return request({
    url: '/api/iot-dorm/auth/mjauth/down',
    method: 'post',
    data:row
  })
}
