import request from '@/router/axios';

export const getBookCategoryDic = (params) => {
  return request({
    url: '/api/iot-library/booktype/tree',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getBookCategoryList = (params) => {
  return request({
    url: '/api/iot-library/booktype/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const addBookCategory = (row) => {
  return request({
    url: '/api/iot-library/booktype/add',
    method: 'post',
    data:row
  })
}
export const getBookCategoryDetails = (params) => {
  return request({
    url: '/api/iot-library/booktype/details',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const updateBookCategory = (row) => {
  return request({
    url: '/api/iot-library/booktype/update',
    method: 'post',
    data:row
  })
}
export const removeBookCategory = (row) => {
  return request({
    url: '/api/iot-library/booktype/remove',
    method: 'post',
    data:row
  })
}