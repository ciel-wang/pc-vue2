import request from '@/router/axios';

export const mjdataList = (current, size, params) => {
  return request({
    url: '/api/iot-visitor/mjdata/list',
    method: 'get',
    params: {
      current,
      size,
      ...params
    }
  })
}

export const mjdataZtree = () => {
  return request({
    url: '/api/iot-visitor/mjdata/devlist',
    method: 'get',
  })
}
