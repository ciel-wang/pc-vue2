import request from '@/router/axios';

export const blacklistList = (current, size, params) => {
  return request({
    url: '/api/iot-visitor/blacklist/list',
    method: 'get',
    params: {
      current,
      size,
      ...params
    }
  })
}

export const levelRemove = (row) => {
  return request({
    url: '/api/iot-visitor/blacklist/remove',
    method: 'post',
    data:row
  })
}
