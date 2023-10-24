import request from '@/router/axios';

export const getBookInfo = (params) => {
  return request({
    url: '/api/iot-library/booklist/select',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getBookMenuList = (params) => {
  return request({
    url: '/api/iot-library/booklist/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const sendBookMenu = (row) => {
  return request({
    url: '/api/iot-library/booklist/update',
    method: 'post',
    data:row
  })
}
export const addBookDuplicate = (row) => {
  return request({
    url: '/api/iot-library/booklist/add/ectype',
    method: 'post',
    data:row
  })
}
export const getBookDuplicateDetails = (params) => {
  return request({
    url: '/api/iot-library/booklist/ectype/details',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const updateBookDuplicate = (row) => {
  return request({
    url: '/api/iot-library/booklist/update/ectype',
    method: 'post',
    data:row
  })
}
export const removeBookDuplicate = (row) => {
  return request({
    url: '/api/iot-library/booklist/remove/ectype',
    method: 'post',
    data:row
  })
}
export const sendCoverimg = (row) => {
  return request({
    url: '/api/iot-library/booklist/upload/coverimg',
    method: 'post',
    data:row
  })
}
export const removeBookPeriodicals = (row) => {
  return request({
    url: '/api/iot-library/booklist/remove',
    method: 'post',
    data:row
  })
}