import request from '@/router/axios';

export const getPersonalAccountDetails = (current, size, params) => {
  return request({
    url: '/api/iot-xf/personmoney/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}


export const getPersonalAccount = ( params) => {
  return request({
    url: '/api/iot-xf/personmoney/account',
    method: 'get',
    params: {
      ...params,
    }
  })
}
