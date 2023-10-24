import request from '@/router/axios';

export const getList = ( param) => {
  return request({
    url: '/api/iot-basic/access/event/list',
    method: 'get',
    params: {
      ...param,
    }
  })
}

export const remove = (row) => {
  return request({
    url: '/api/iot-basic/access/event/remove',
    method: 'post',
    data:row
  })
}
