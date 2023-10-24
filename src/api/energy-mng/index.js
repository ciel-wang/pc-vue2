import request from '@/router/axios';

export const reqEnergyDevList = (params) => {
  return request({
    url: '/api/iot-sdctrl/dev/list',
    method: 'get',
    params: { ...params }
  })
}
export const reqEnergyDevDetails = (params) => {
  return request({
    url: '/api/iot-sdctrl/dev/details',
    method: 'get',
    params: { ...params }
  })
}
export const sendEnergyDevForm = (data) => {
  return request({
    url: '/api/iot-sdctrl/dev/update',
    method: 'post',
    data
  })
}
export const removeEnergyDev = (data) => {
  return request({
    url: '/api/iot-sdctrl/dev/remove',
    method: 'post',
    data
  })
}
export const updateWorkparam = (data) => {
  return request({
    url: '/api/iot-sdctrl/dev/update/workparam',
    method: 'post',
    data
  })
}

export const reqEnergyxfDetails = (params) => {
  return request({
    url: '/api/iot-sdctrl/data/list',
    method: 'get',
    params: { ...params }
  })
}

export const downloadDevCommand = (data) => {
  return request({
    url: '/api/iot-sdctrl/dev/save/devcommand',
    method: 'post',
    data
  })
}

export const reqEnergyDevLog = (params) => {
  return request({
    url: '/api/iot-sdctrl/dev/command/list',
    method: 'get',
    params: { ...params }
  })
}
export const repeatExecute = (data) => {
  return request({
    url: '/api/iot-sdctrl/dev/command/repeat/execute',
    method: 'post',
    data
  })
}

export const reqIndexData = (params) => {
  return request({
    url: '/api/iot-sdctrl/index/statistics/data',
    method: 'get',
    params: { ...params }
  })
}


export const reqWalletAccinfo = (params) => {
  return request({
    url: '/api/iot-sdctrl/wallet/select-accinfo',
    method: 'get',
    params: { ...params }
  })
}
export const sendWalletRecharge = (data) => {
  return request({
    url: '/api/iot-sdctrl/wallet/recharge',
    method: 'post',
    data
  })
}
export const sendWalletTransger = (data) => {
  return request({
    url: '/api/iot-sdctrl/wallet/transfer',
    method: 'post',
    data
  })
}
export const sendWalletRefund = (data) => {
  return request({
    url: '/api/iot-sdctrl/wallet/refund',
    method: 'post',
    data
  })
}

export const reqNocardRechargeList = (params) => {
  return request({
    url: '/api/iot-sdctrl/recharge/list',
    method: 'get',
    params: { ...params }
  })
}
export const sendRechargeAudit = (data) => {
  return request({
    url: '/api/iot-sdctrl/recharge/audit',
    method: 'post',
    data
  })
}
export const sendRechargeReject = (data) => {
  return request({
    url: '/api/iot-sdctrl/recharge/reject',
    method: 'post',
    data
  })
}
export const sendRechargePreSubmit = (data) => {
  return request({
    url: '/api/iot-sdctrl/recharge/submit',
    method: 'post',
    data
  })
}

export const sendWalletRefundToXf = (data) => {
  return request({
    url: '/api/iot-sdctrl/wallet/transfer-xf',
    method: 'post',
    data
  })
}