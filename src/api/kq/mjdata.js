import request from '@/router/axios';

export const kqMjdata = (params) => {
  return request({
    url: '/api/iot-kq/mjdata/list',
    method: 'get',
    params:{
        ...params
    }
  })
}
export const removeMjdata = (row) => {
  return request({
    url: '/api/iot-kq/mjdata/remove',
    method: 'post',
    data:row
  })
}