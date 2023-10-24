import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/dev/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const getEmpCategoryList = ( params) => {
  return request({
    url: '/api/iot-xf/dev/emp/category/list',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const getDetail = ( params) => {
  return request({
    url: '/api/iot-xf/dev/detail',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const addXfDev = (row) => {
  return request({
    url: '/api/iot-xf/dev/add',
    method: 'post',
    data:row
  })
}
export const addXfMeal = (row) => {
  return request({
    url: '/api/iot-xf/dev/meal',
    method: 'post',
    data:row
  })
}
export const faceSetParHardWare = (row) => {
  return request({
    url: '/api/iot-xf/dev/face/setpar/hardware',
    method: 'post',
    data:row
  })
}
export const faceSetParSeller = (row) => {
  return request({
    url: '/api/iot-xf/dev/face/setpar/seller',
    method: 'post',
    data:row
  })
}
export const updateXfDev = (row) => {
  return request({
    url: '/api/iot-xf/dev/update',
    method: 'post',
    data:row
  })
}
export const removeXfDev = (ids) => {
  return request({
    url: '/api/iot-xf/dev/remove',
    method: 'post',
    data:ids
  })
}
export const faceSetDevParUnlineMaxXfMoney = (ids) => {
  return request({
    url: '/api/iot-xf/dev/face/setpar/empcategory',
    method: 'post',
    data:ids
  })
}
export const geEmpAuthtListByDev = (params) => {
  return request({
    url: '/api/iot-xf/empauth/selectauth',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const getDevEventDownParams = () => {
  return request({
    url: '/api/iot-xf/dev/down/params',
    method: 'get',
  })
}

export const sendDevReadcard = (row) => {
  return request({
    url: '/api/iot-xf/dev/face/setpar/secret',
    method: 'post',
    data:row
  })
}

export const xfDevExport = (row) => {
  return request({
    url: `/api/iot-xf/dev/list/export`,
    method: 'post',
    data:row,
    responseType:'blob'
  })
}

// 设备升级
export const sendDevUpgrade = (row) => {
  return request({
    url: '/api/iot-xf/dev/upgrade',
    method: 'post',
    data:row
  })
}