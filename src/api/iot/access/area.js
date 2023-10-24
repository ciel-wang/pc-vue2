import request from '@/router/axios';

export const getList = (params) => {
  return request({
    url: '/api/iot-basic/access/area/list',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const getAreaTree = (params) => {
  return request({
    url: '/api/iot-basic/access/area/tree',
    method: 'get',
    params: {
      ...params,
    }
  })
}


export const removeArea = (ids) => {
  return request({
    url: '/api/iot-basic/access/area/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}



export const addArea = (row) => {
  return request({
    url: '/api/iot-basic/access/area/submit',
    method: 'post',
    data: row
  })
}


export const updateArea = (row) => {
  return request({
    url: '/api/iot-basic/access/area/update',
    method: 'post',
    data: row
  })
}



export const getAreaById = (id) => {
  return request({
    url: '/api/iot-basic/access/area/detail',
    method: 'get',
    params: {
      id,
    }
  })
}
