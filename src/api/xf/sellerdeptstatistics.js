import request from '@/router/axios';

export const getDataList = (params) => {
  return request({
    url: '/api/iot-xf/xfstatistics/sellerdept/list',
    method: 'get',
    params: {
      ...params,
    }
  })
}