import request from '@/router/axios';

export const getPublisherDic = (params) => {
  return request({
    url: '/api/iot-library/publisher-unit/selectlist',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getPublisherList = (params) => {
  return request({
    url: '/api/iot-library/publisher-unit/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const addPublisher = (row) => {
  return request({
    url: '/api/iot-library/publisher-unit/add',
    method: 'post',
    data:row
  })
}
export const getPublisherDetails = (params) => {
  return request({
    url: '/api/iot-library/publisher-unit/details',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const updatePublisher = (row) => {
  return request({
    url: '/api/iot-library/publisher-unit/update',
    method: 'post',
    data:row
  })
}
export const removePublisher = (row) => {
  return request({
    url: '/api/iot-library/publisher-unit/remove',
    method: 'post',
    data:row
  })
}
