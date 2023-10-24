import request from '@/router/axios';

export const getCarList = (params) => {
  return request({
    url: '/api/iot-car/carinfo/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const addCar = (row) => {
  return request({
    url: '/api/iot-car/carinfo/add',
    method: 'post',
    data:row
  })
}
export const getCarDetails = (params) => {
  return request({
    url: '/api/iot-car/carinfo/details',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const updateCar = (row) => {
  return request({
    url: '/api/iot-car/carinfo/update',
    method: 'post',
    data:row
  })
}
export const removeCar = (row) => {
  return request({
    url: '/api/iot-car/carinfo/remove',
    method: 'post',
    data:row
  })
}
export const authDowm = (row) => {
  return request({
    url: '/api/iot-car/event/add',
    method: 'post',
    data:row
  })
}
export const getEventList = (params) => {
  return request({
    url: '/api/iot-car/event/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const getCarInoutList = (params) => {
  return request({
    url: '/api/iot-car/inout/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const getCarAuthList = (params) => {
  return request({
    url: '/api/iot-car/devauth/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const getCarMonthDetails = (params) => {
  return request({
    url: '/api/iot-car/carinfo/renewal/info',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const carMonthSubmit = (row) => {
  return request({
    url: '/api/iot-car/carinfo/month/vip/renewal',
    method: 'post',
    data:row
  })
}

// 审核部分
export const getCarAuditList = (params) => {
  return request({
    url: '/api/iot-car/audit/platenum/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const agreeCarChange = (row) => {
  return request({
    url: '/api/iot-car/audit/platenum/audit',
    method: 'post',
    data:row
  })
}
export const rejectCarChange = (row) => {
  return request({
    url: '/api/iot-car/audit/platenum/reject',
    method: 'post',
    data:row
  })
}


// 实时监控页面
export const getMonitorData = (params) => {
  return request({
    url: '/api/iot-car/real/monitor/data',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const openDev = (row) => {
  return request({
    url: '/api/iot-car/dev/remote/open',
    method: 'post',
    data:row
  })
}
export const cancelDev = (row) => {
  return request({
    url: '/api/iot-car/inout/cancel/inout',
    method: 'post',
    data:row
  })
}
export const chargeOpenDev = (row) => {
  return request({
    url: '/api/iot-car/inout/car/permit',
    method: 'post',
    data:row
  })
}
export const getWaitCarData = (params) => {
  return request({
    url: '/api/iot-car/real/monitor/wait/queue/data',
    method: 'get',
    params: {
      ...params
    }
  })
}