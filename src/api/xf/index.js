import request from '@/router/axios';

export const getXfData = () => {
  return request({
    url: '/api/iot-xf/home/statistics/data',
    method: 'get',
  })
}