import request from '@/router/axios';

export const getRulesList = (params) => {
  return request({
    url: '/api/iot-car/fee/rule/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const addRules = (row) => {
  return request({
    url: '/api/iot-car/fee/rule/add',
    method: 'post',
    data:row
  })
}
export const getRulesDetails = (params) => {
  return request({
    url: '/api/iot-car/fee/rule/details',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const updateRules = (row) => {
  return request({
    url: '/api/iot-car/fee/rule/update',
    method: 'post',
    data:row
  })
}
export const removeRules = (row) => {
  return request({
    url: '/api/iot-car/fee/rule/remove',
    method: 'post',
    data:row
  })
}
export const rulesCalc = (row) => {
  return request({
    url: '/api/iot-car/fee/rule/compute',
    method: 'post',
    data:row
  })
}
export const getOnroadPaymentList = (params) => {
  return request({
    url: '/api/iot-car/fee/bills/list',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const getMonthCarRenewList = (params) => {
  return request({
    url: '/api/iot-car/carinfo/month/renewal/list',
    method: 'get',
    params: {
      ...params
    }
  })
}