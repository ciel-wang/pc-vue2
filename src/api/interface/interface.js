import request from '@/router/axios';

export const cussqlList = (params) => {
  return request({
    url: '/api/iot-sql/cussql/list',
    method: 'get',
    params:{
        ...params
    }
  })
}
export const cussqlDetails = (params) => {
  return request({
    url: '/api/iot-sql/cussql/details',
    method: 'get',
    params:{
        ...params
    }
  })
}

export const cussqlUpdate = (row) => {
  return request({
    url: '/api/iot-sql/cussql/update',
    method: 'post',
    data:row
  })
}

export const cussqlAdd = (row) => {
  return request({
    url: '/api/iot-sql/cussql/add',
    method: 'post',
    data:row
  })
}

export const cussqlRrmove = (row) => {
  return request({
    url: '/api/iot-sql/cussql/remove',
    method: 'post',
    data:row
  })
}

export const cussqlDataview = (params) => {
  return request({
    url: `/api/iot-sql/dataview/${params}`,
    method: 'get',
  })
}
// 报表列表
export const reqReportList = (params) => {
  return request({
    url: `/api/iot-mreport/reportList`,
    method: 'get',
    params:{...params}
  })
}
export const reportListRemove = (params) => {
  return request({
    url: `/api/iot-mreport/reportRemove`,
    method: 'post',
    data:params
  })
}