import request from '@/router/axios';

export const getSzDetailQueryList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/szdetail/query/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}


export const getXfStatistticsList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/szstatistics/oprt/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getXfStatistticsDeptList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/szstatistics/dept/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const getXfStatistticsClassList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/szstatistics/class/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

