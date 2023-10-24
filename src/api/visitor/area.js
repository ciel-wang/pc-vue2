import request from '@/router/axios';

export const getTreeList = () => {
  return request({
    url: '/api/iot-visitor/area/tree',
    method: 'get'
  })
}


export const addArea = (row) => {
  return request({
    url: '/api/iot-visitor/area/add',
    method: 'post',
    data:row
  })
}

export const updateArea = (row) => {
  return request({
    url: '/api/iot-visitor/area/update',
    method: 'post',
    data:row
  })
}

export const removeArea = (ids) => {
  return request({
    url: '/api/iot-visitor/area/delete',
    method: 'post',
    data:ids
  })
}

export const getAreaList = (current, size, params) => {
  return request({
    url: '/api/iot-visitor/area/list',
    method: 'get',
    params: {
      ...params,
      current,
      size
    }
  })
}


export const companyList = () => {
  return request({
    url: '/api/iot-visitor/area/company',
    method: 'get'
  })
}

export const areaList = (schoolId) => {
  return request({
    url: '/api/iot-visitor/area/list/type1',
    method: 'get',
    params:{
      schoolId
    }
  })
}

export const devList = (devAreaId) => {
  return request({
    url: '/api/iot-visitor/dev/select/list',
    method: 'get',
    params:{
      devAreaId
    }
  })
}

export const getDetails = (id) => {
  return request({
    url: '/api/iot-visitor/area/details',
    method: 'get',
    params:{
      id
    }
  })
}


export const positionList = (parentId) => {
  return request({
    url: '/api/iot-visitor/area/list/type2',
    method: 'get',
    params:{
      parentId
    }
  })
}
