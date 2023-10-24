import request from '@/router/axios';

export const getXfDetailQueryList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/xfdetail/query/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const getXfStatisticsByDev = (current, size, params) => {
  return request({
    url: '/api/iot-xf/xfstatistics/dev/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const getXfStatisticsByDept = (current, size, params) => {
  return request({
    url: '/api/iot-xf/xfstatistics/dept/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const getXfStatisticsBySeller = (current, size, params) => {
  return request({
    url: '/api/iot-xf/xfstatistics/seller/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const getXfStatisticsByEmp = (current, size, params) => {
  return request({
    url: '/api/iot-xf/xfstatistics/emp/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const updateDevXfStatistics = ( data) => {
  return request({
    url: '/api/iot-xf/xfstatistics/dev/statisticsdata',
    method: 'post',
    data:data
  })
}
export const updateDeptXfStatistics = (data) => {
  return request({
    url: '/api/iot-xf/xfstatistics/dept/statisticsdata',
    method: 'post',
    data:data
  })
}
export const updateSellerXfStatistics = (data) => {
  return request({
    url: '/api/iot-xf/xfstatistics/seller/statisticsdata',
    method: 'post',
    data:data
  })
}
export const getXfStatisticsByClass = (params) => {
  return request({
    url: '/api/iot-xf/xfstatistics//class/list',
    method: 'get',
    params: {
      ...params,
    }
  })
}