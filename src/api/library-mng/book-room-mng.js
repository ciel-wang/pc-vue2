import request from '@/router/axios';

export const getIndexData = (params) => {
  return request({
    url: '/api/iot-library/lb/home/data',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getLibraryDic = (params) => {
  return request({
    url: '/api/iot-library/lb/selectlist',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getLibraryZtreeDic = (params) => {
  return request({
    url: '/api/iot-library/lb/tree',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getLibraryList = (params) => {
  return request({
    url: '/api/iot-library/lb/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const addLibrary = (row) => {
  return request({
    url: '/api/iot-library/lb/add',
    method: 'post',
    data:row
  })
}
export const addBatchPeriodicals = (row) => {
  return request({
    url: '/api/iot-library/lb/batch/create/book-periodicals',
    method: 'post',
    data:row
  })
}
export const getLibraryDetails = (params) => {
  return request({
    url: '/api/iot-library/lb/details',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const updateLibrary = (row) => {
  return request({
    url: '/api/iot-library/lb/update',
    method: 'post',
    data:row
  })
}
export const removeLibrary = (row) => {
  return request({
    url: '/api/iot-library/lb/remove',
    method: 'post',
    data:row
  })
}
export const updateDevs = (row) => {
  return request({
    url: '/api/iot-library/lb/update/devs',
    method: 'post',
    data:row
  })
}


export const getPeriodicalsList = (params) => {
  return request({
    url: '/api/iot-library/lb/book-periodicals/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const sendPeriodicals = (row) => {
  return request({
    url: '/api/iot-library/lb/book-periodicals/update',
    method: 'post',
    data:row
  })
}
export const removePeriodicals = (row) => {
  return request({
    url: '/api/iot-library/lb/book-periodicals/remove',
    method: 'post',
    data:row
  })
}
