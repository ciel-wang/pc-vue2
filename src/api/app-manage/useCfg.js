import request from '@/router/axios';

export const getTableList = (params) => {
  return request({
    url: '/api/blade-system/appmenu/list',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const getMunuSelect = (params) => {
  return request({
    url: '/api/blade-system/appmenu/root/list',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const getMunuDetails = (params) => {
  return request({
    url: '/api/blade-system/appmenu/details',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const add = (row) => {
  return request({
    url: '/api/blade-system/appmenu/save',
    method: 'post',
    data: row
  })
}
export const update = (row) => {
  return request({
    url: '/api/blade-system/appmenu/update',
    method: 'post',
    data: row
  })
}
export const remove = (row) => {
  return request({
    url: '/api/blade-system/appmenu/remove',
    method: 'post',
    data: row
  })
}
export const updateEnable = (row) => {
  return request({
    url: '/api/blade-system/appmenu/update/enable',
    method: 'post',
    data: row
  })
}
export const updateDisplay = (row) => {
  return request({
    url: '/api/blade-system/appmenu/update/display',
    method: 'post',
    data: row
  })
}
