import request from '@/router/axios';

export const reqTableData = (params) => {
  return request({
    url: '/api/iot-xf/report/curr/accountant/data',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const reqPeriodInfo = (params) => {
  return request({
    url: '/api/iot-xf/report/accountant/info',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const sendPeriodStatic = (params) => {
  return request({
    url: '/api/iot-xf/report/compute/details',
    method: 'post',
    data:params
  })
}
export const sendPeriodSettle = (params) => {
  return request({
    url: '/api/iot-xf/report/accountant/settle',
    method: 'post',
    data:params
  })
}
export const sendPeriodRollback = (params) => {
  return request({
    url: '/api/iot-xf/report/accountant/callback',
    method: 'post',
    data:params
  })
}