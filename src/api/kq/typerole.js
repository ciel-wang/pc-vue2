import request from '@/router/axios';

export const getTyperoleList = (params) => {
  return request({
    url: '/api/iot-kq/typerole/list',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const typeroleAdd = (row) => {
  return request({
    url: '/api/iot-kq/typerole/add',
    method: 'post',
    data:row
  })
}

export const typeroleUpdate = (row) => {
  return request({
    url: '/api/iot-kq/typerole/update',
    method: 'post',
    data: row
  })
}

export const typeroleRemove = (row) => {
  return request({
    url: '/api/iot-kq/typerole/remove',
    method: 'post',
    data:row
  })
}

export const typeroleDetails = (params) => {
  return request({
    url: '/api/iot-kq/typerole/details',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const typeroleReceiptList = (params) => {
  return request({
    url: '/api/iot-kq/receipt/empauth/list',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const checkboxData = () => {
  return request({
    url: '/api/iot-kq/typerole/selectlist/alltype',
    method: 'get',
  })
}

export const typeroleAddAuditemp = (row) => {
  return request({
    url: '/api/iot-kq/receipt/empauth/add/auditemp',
    method: 'post',
    data: row
  })
}

export const typeroleDelAuditemp = (row) => {
  return request({
    url: '/api/iot-kq/receipt/empauth/remove/auditemp',
    method: 'post',
    data: row
  })
}

export const receiptSelectedEmpList = (params) => {
  return request({
    url: '/api/iot-kq/receipt/empauth/role/emps',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const empauthSubmit = (row) => {
  return request({
    url: '/api/iot-kq/receipt/empauth/add/emp',
    method: 'post',
    data: row
  })
}

export const empauthDelet = (row) => {
  return request({
    url: '/api/iot-kq/receipt/empauth/remove/emp',
    method: 'post',
    data: row
  })
}

export const selectDeptData = (params) => {
  return request({
    url: '/api/iot-kq/select/dept/emplist',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const updateIspaid = (row) => {
  return request({
    url: '/api/iot-kq/typerole/update/ispaid/status',
    method: 'post',
    data: row
  })
}

export const updateRoleStatus = (row) => {
  return request({
    url: '/api/iot-kq/typerole/update/role/status',
    method: 'post',
    data: row
  })
}
