import request from '@/router/axios';

export const getReaderGroupEmps = (params) => {
  return request({
    url: '/api/iot-library/reader-group/emps',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getReaderGroupList = (params) => {
  return request({
    url: '/api/iot-library/reader-group/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const addReaderGroup = (row) => {
  return request({
    url: '/api/iot-library/reader-group/add',
    method: 'post',
    data:row
  })
}
export const getReaderGroupDetails = (params) => {
  return request({
    url: '/api/iot-library/reader-group/details',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const updateReaderGroup = (row) => {
  return request({
    url: '/api/iot-library/reader-group/update',
    method: 'post',
    data:row
  })
}
export const removeReaderGroup = (row) => {
  return request({
    url: '/api/iot-library/reader-group/remove',
    method: 'post',
    data:row
  })
}
export const addReaderGroupEmps = (row) => {
  return request({
    url: '/api/iot-library/reader-group/add/emps',
    method: 'post',
    data:row
  })
}
export const removeReaderGroupEmps = (row) => {
  return request({
    url: '/api/iot-library/reader-group/remove/emps',
    method: 'post',
    data:row
  })
}
