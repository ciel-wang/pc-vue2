import request from '@/router/axios';

export const getBizOprtLogList = (current, size, params) => {
  return request({
    url: '/api/blade-system/bizoprtlog/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
