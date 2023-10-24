import request from '@/router/axios';

export const getList = (param) => {
  return request({
    url: '/api/iot-basic/access/door/list',
    method: 'get',
    params: {
      ...param,
    }
  })
}
export const mjDataExport = (row) => {
  return request({
    url: '/api/iot-basic/access/door/list/export',
    method: 'post',
    data:row,
    responseType:'blob'
  })
}