import request from '@/router/axios';

export const getIndexData = () => {
  return request({
    url: '/api/iot-dorm/home/statistics/data',
    method: 'get',
  })
}
export const getTableData = (params) => {
  return request({
    url: '/api/iot-dorm/dorm/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const addDorm = (row) => {
  return request({
    url: '/api/iot-dorm/dorm/add',
    method: 'post',
    data:row
  })
}
export const dormDetails = (params) => {
  return request({
    url: '/api/iot-dorm/dorm/details',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const updateDorm = (row) => {
  return request({
    url: '/api/iot-dorm/dorm/update',
    method: 'post',
    data:row
  })
}
export const removeDorm = (row) => {
  return request({
    url: '/api/iot-dorm/dorm/remove',
    method: 'post',
    data:row
  })
}
export const getDormZtree = (params) => {
  return request({
    url: '/api/iot-dorm/floor/tree',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const addAssets = (row) => {
  return request({
    url: '/api/iot-dorm/property/add',
    method: 'post',
    data:row
  })
}
export const assetsTableList = (params) => {
  return request({
    url: '/api/iot-dorm/property/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const assetsDetails = (params) => {
  return request({
    url: '/api/iot-dorm/property/details',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const updateAssets = (row) => {
  return request({
    url: '/api/iot-dorm/property/update',
    method: 'post',
    data:row
  })
}
export const removeAssets = (row) => {
  return request({
    url: '/api/iot-dorm/property/remove',
    method: 'post',
    data:row
  })
}
export const getBedCabinetTable = (params) => {
  return request({
    url: '/api/iot-dorm/dorm/bad/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const batchDormstatus = (row) => {
  return request({
    url: '/api/iot-dorm/dorm/update/batch/dormstatus',
    method: 'post',
    data:row
  })
}
export const addBed = (row) => {
  return request({
    url: '/api/iot-dorm/dorm/bad/add',
    method: 'post',
    data:row
  })
}
export const updateBed = (row) => {
  return request({
    url: '/api/iot-dorm/dorm/bad/update',
    method: 'post',
    data:row
  })
}
export const removeBed = (row) => {
  return request({
    url: '/api/iot-dorm/dorm/bad/remove',
    method: 'post',
    data:row
  })
}
export const getInOutData = (params) => {
  return request({
    url: '/api/iot-dorm/inout/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getSystemDetails = (params) => {
  return request({
    url: '/api/iot-dorm/system/details',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const updateSystem = (row) => {
  return request({
    url: '/api/iot-dorm/system/update',
    method: 'post',
    data:row
  })
}