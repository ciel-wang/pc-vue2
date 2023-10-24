import request from '@/router/axios';

export const getTableData = (params) => {
  return request({
    url: '/api/iot-basic/resign/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const restoreEmp = (row) => {
  return request({
    url: '/api/iot-basic/resign/restore',
    method: 'post',
    data:row
  })
}
export const removeEmp = (row) => {
  return request({
    url: '/api/iot-basic/resign/remove',
    method: 'post',
    data:row
  })
}