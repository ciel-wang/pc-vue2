import request from '@/router/axios';

export const getReaderInfo = (params) => {
  return request({
    url: '/api/iot-library/reader-group/select/reader',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getBookInfo = (params) => {
  return request({
    url: '/api/iot-library/booklist-ectype/select/book',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getEmpBookList = (params) => {
  return request({
    url: '/api/iot-library/borrow-data/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const sendBorrowBook = (row) => {
  return request({
    url: '/api/iot-library/borrow-data/borrow',
    method: 'post',
    data:row
  })
}
export const sendReturnBook = (row) => {
  return request({
    url: '/api/iot-library/borrow-data/return/borrow',
    method: 'post',
    data:row
  })
}
export const sendRenewBook = (row) => {
  return request({
    url: '/api/iot-library/borrow-data/continue/borrow',
    method: 'post',
    data:row
  })
}