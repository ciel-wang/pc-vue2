import request from '@/router/axios';

export const getBizDictByCode = (params) => {
  return request({
    url: '/api/iot-basic/dict/code',
    method: 'get',
    params: {
      ...params
    }
  })
}