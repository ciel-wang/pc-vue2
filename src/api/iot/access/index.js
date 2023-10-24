import request from '@/router/axios';

export const getInitData = () => {
  return request({
    url: '/api/iot-basic/access/home/statistics/data',
    method: 'get'
  })
}