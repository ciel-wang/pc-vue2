import request from '@/router/axios';

export const getList = (params) => {
  return request({
    url: '/api/iot-visitor/event/list',
    method: 'get',
    params:{
      ...params
    }
  })
}