import request from '@/router/axios';

export const getRefundEmpList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/refund/emplist',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}


export const refundSubmit = (row) => {
  return request({
    url: '/api/iot-xf/refund/submit',
    method: 'post',
    data:row
  })
}



export const getErrorRecoveryList= (current, size, params) => {
  return request({
    url: '/api/iot-xf/error/recovery/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}


export const errorRecoverSubmit = (row) => {
  return request({
    url: '/api/iot-xf/error/recovery/submit',
    method: 'post',
    data:row
  })
}

export const reqWithdrawData = (params) => {
  return request({
    url: '/api/iot-basic/cash-withdrawal/list',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const rejectWithdraw = (data) => {
  return request({
    url: '/api/iot-basic/cash-withdrawal/reject',
    method: 'post',
    data
  })
}
export const auditWithdraw = (data) => {
  return request({
    url: '/api/iot-basic/cash-withdrawal/audit',
    method: 'post',
    data
  })
}
export const againSendWithdraw = (data) => {
  return request({
    url: '/api/iot-basic/cash-withdrawal/refund-repeat-send-wx',
    method: 'post',
    data
  })
}
