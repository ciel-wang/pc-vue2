import request from '@/router/axios';

export const getAccDetailsQueryBalanceList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/accdetail/query/balance/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
