import request from '@/router/axios';

export const getMonitorSchemaList = (params) => {
  return request({
    url: '/api/iot-basic/access/monitor/schema/list',
    method: 'get',
    params: {
      ...params,
    }
  })
}


export const getDetails = (params) => {
  return request({
    url: '/api/iot-basic/access/monitor/schema/details',
    method: 'get',
    params: {
      ...params,
    }
  })
}


export const remove = (row) => {
  return request({
    url: '/api/iot-basic/access/monitor/schema/remove',
    method: 'post',
    data: row
  })
}


export const addMonitorSchema = (param) => {
  return request({
    url: '/api/iot-basic/access/monitor/schema/add',
    method: 'post',
    data: param
  })
}


export const updateMonitorSchema = (param) => {
  return request({
    url: '/api/iot-basic/access/monitor/schema/update',
    method: 'post',
    data: param
  })
}



export const getSimpleMonitorSchemaList = (current, size, params) => {
  return request({
    url: '/api/iot-basic/access/monitor/schema/simplelist',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}



export const getMonitorEmpList = (current, size, params) => {
  return request({
    url: '/api/iot-basic/dev/schema/mjdata',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const openDoor = (param) => {
  return request({
    url: '/api/iot-basic/access/ic/open/door',
    method: 'post',
    data: param
  })
}