import request from '@/router/axios';

export const getList = (params) => {
  return request({
    url: '/api/iot-basic/access/auth/select/iclist',
    method: 'get',
    params: {
      ...params,
    }
  })
}


export const getAiList = (params) => {
  return request({
    url: '/api/iot-basic/access/auth/select/ailist',
    method: 'get',
    params: {
      ...params,
    }
  })
}
