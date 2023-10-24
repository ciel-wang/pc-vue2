import request from '@/router/axios';

export const getParentData = (params) => {
  return request({
    url: '/api/iot-basic/parents/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const parentsUpdate = (row) => {
  return request({
    url: '/api/iot-basic/parents/update',
    method: 'post',
    data:row
  })
}
export const parentsRemove = (row) => {
  return request({
    url: '/api/iot-basic/parents/remove',
    method: 'post',
    data:row
  })
}