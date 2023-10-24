import request from '@/router/axios';

export const schoolUpdate = (row) => {
  return request({
    url: '/api/iot-basic/school/update',
    method: 'post',
    data:row
  })
}
export const schoolRemove = (row) => {
  return request({
    url: '/api/iot-basic/school/remove',
    method: 'post',
    data:row
  })
}
export const schoolList = () => {
  return request({
    url: '/api/iot-basic/school/list',
    method: 'get',
  })
}
export const schoolDetails = (id) => {
  return request({
    url: '/api/iot-basic/school/details',
    method: 'get',
    params:{
      id
    }
  })
}
export const getIndexData = () => {
  return request({
    url: '/api/iot-basic/home/statistics/data',
    method: 'get',
  })
}
export const base64Faceimg = (row) => {
  return request({
    url: '/api/iot-basic/user/upload/user/base64/faceimg',
    method: 'post',
    data:row
  })
}