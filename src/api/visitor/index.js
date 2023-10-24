import request from '@/router/axios';

export const getInitData = () => {
  return request({
    url: '/api/iot-visitor/home/statistics/data',
    method: 'get'
  })
}