import request from '@/router/axios';

export const getList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/seller/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}


export const addSeller = (row) => {
  return request({
    url: '/api/iot-xf/seller/add',
    method: 'post',
    data:row
  })
}

export const updateSeller = (row) => {
  return request({
    url: '/api/iot-xf/seller/update',
    method: 'post',
    data:row
  })
}

export const removeSeller = (ids) => {
  return request({
    url: '/api/iot-xf/seller/remove',
    method: 'post',
    data:ids
  })
}

export const getDetails = (id) => {
  return request({
    url: '/api/iot-xf/seller/detail',
    method: 'get',
    params: {
      id,
    }
  })
}


export const sellerTree = () => {
  return request({
    url: '/api/iot-xf/seller/tree',
    method: 'get',
  })
}


export const sellerSelect = () => {
  return request({
    url: '/api/iot-xf/seller/select',
    method: 'get',
  })
}
export const sellerDevZtreeData = () => {
  return request({
    url: '/api/iot-xf/seller/tree-devs',
    method: 'get',
  })
}
