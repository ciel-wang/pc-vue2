import request from '@/router/axios';

export const getTableData = (params) => {
  return request({
    url: '/api/iot-dorm/floor/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const addFloor = (row) => {
  return request({
    url: '/api/iot-dorm/floor/add',
    method: 'post',
    data:row
  })
}
export const updateFloor = (row) => {
  return request({
    url: '/api/iot-dorm/floor/update',
    method: 'post',
    data:row
  })
}
export const removeFloor = (row) => {
  return request({
    url: '/api/iot-dorm/floor/remove',
    method: 'post',
    data:row
  })
}
export const getFloorDic = (params) => {
  return request({
    url: '/api/iot-dorm/floor/selectlist',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const addAuto = (row) => {
  return request({
    url: '/api/iot-dorm/floor/batch/add',
    method: 'post',
    data:row
  })
}
export const getFloorDevDic = () => {
  return request({
    url: '/api/iot-dorm/floor/devtree',
    method: 'get',
  })
}
export const devSubmit = (row) => {
  return request({
    url: '/api/iot-dorm/floor/update/devs',
    method: 'post',
    data:row
  })
}
export const getFloorDevDetails = (params) => {
  return request({
    url: '/api/iot-dorm/floor/details',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const adminAuthSubmit = (row) => {
  return request({
    url: '/api/iot-dorm/floor/empmng/auth',
    method: 'post',
    data:row
  })
}
export const getFloorAdminDic = (params) => {
  return request({
    url: '/api/iot-dorm/floor/empmng/auth',
    method: 'get',
    params:{
        ...params
    }
  })
}
export const getDormZtree = ( params) => {
  return request({
    url: '/api/iot-dorm/floor/tree',
    method: 'get',
    params: {
      ...params,
    }
  })
}