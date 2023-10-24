import request from '@/router/axios';

export const getGrantCode = (params) => {
  return request({
    url: '/api/iot-basic/grant/code',
    method: 'get',
    params: {
      ...params,
    }
  })
}
