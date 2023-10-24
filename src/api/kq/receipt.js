import request from '@/router/axios';

export const receiptList = (params) => {
  return request({
    url: '/api/iot-kq/receipt/list',
    method: 'get',
    params:{
        ...params
    }
  })
}

export const typeroleSelectlist = (params) => {
  return request({
    url: '/api/iot-kq/typerole/selectlist',
    method: 'get',
    params:{
        ...params
    }
  })
}

export const receiptAdd = (row) => {
  return request({
    url: '/api/iot-kq/receipt/generate',
    method: 'post',
    data:row
  })
}

export const receiptBetweentime = (params) => {
  return request({
    url: '/api/iot-kq/receipt/compute/working/betweentime',
    method: 'get',
    params:{
        ...params
    }
  })
}

export const receiptAddInitdata = (params) => {
  return request({
    url: '/api/iot-kq/receipt/initdata',
    method: 'get',
    params:{
        ...params
    }
  })
}

export const auditempList = (params) => {
  return request({
    url: '/api/iot-kq/receipt/audit/emp',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const receiptDetails = (params) => {
  return request({
    url: '/api/iot-kq/receipt/details',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const receiptUpdate = (row) => {
  return request({
    url: '/api/iot-kq/receipt/update',
    method: 'post',
    data:row
  })
}

export const receiptRemove = (row) => {
  return request({
    url: '/api/iot-kq/receipt/remove',
    method: 'post',
    data:row
  })
}