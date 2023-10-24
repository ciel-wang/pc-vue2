import request from '@/router/axios';

export const getJsTree = (params) => {
  return request({
    url: '/api/iot-basic/access/dev/rule/jscode-fieldtree',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const submitJsCode = (param) => {
  return request({
    url: '/api/iot-basic/access/dev/rule/execute-jscode',
    method: 'post',
    data: param
  })
}
export const addEditJsCode = (param) => {
  return request({
    url: '/api/iot-basic/access/dev/rule/update',
    method: 'post',
    data: param
  })
}
export const remove = (param) => {
  return request({
    url: '/api/iot-basic/access/dev/rule/remove',
    method: 'post',
    data: param
  })
}
export const getJsCodeDetails = (params) => {
  return request({
    url: '/api/iot-basic/access/dev/rule/details',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const getJsList = (params) => {
  return request({
    url: '/api/iot-basic/access/dev/rule/list',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const getJsHistory = (params) => {
  return request({
    url: '/api/iot-basic/access/dev/rule/history/list',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const historyDetails = (params) => {
  return request({
    url: '/api/iot-basic/access/dev/rule/history/details',
    method: 'get',
    params: {
      ...params,
    }
  })
}
