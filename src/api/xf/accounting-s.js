import request from '@/router/axios';

export const initData = (params) => {
  return request({
    url: '/api/iot-xf/accdetail/accounting/statistics',
    method: 'get',
    params: {
      ...params,
    }
  })
}

export const initDeptData = (params) => {
  return request({
    url: '/api/iot-xf/accdetail/accounting/dept/statistics',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const initClassData = (params) => {
  return request({
    url: '/api/iot-xf/accdetail/accounting/class/statistics',
    method: 'get',
    params: {
      ...params,
    }
  })
}