import request from '@/router/axios';

export const getTableData = (params) => {
  return request({
    url: '/api/iot-dorm/repair/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const addForm = (row) => {
  return request({
    url: '/api/iot-dorm/repair/add',
    method: 'post',
    data:row
  })
}
export const removeForm = (row) => {
  return request({
    url: '/api/iot-dorm/repair/remove',
    method: 'post',
    data:row
  })
}
export const receiptsHandle = (row) => {
  return request({
    url: '/api/iot-dorm/repair/finish',
    method: 'post',
    data:row
  })
}
export const getDormAuth = (params) => {
  return request({
    url: '/api/iot-dorm/auth/mjlist',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getVisitorDormAuth = (params) => {
  return request({
    url: '/api/iot-dorm/auth/visitor/mjlist',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const receiptsOrder = (row) => {
  return request({
    url: '/api/iot-dorm/repair/handling',
    method: 'post',
    data:row
  })
}