import request from '@/router/axios';

export const getDeptZtreeData = () => {
  return request({
    url: '/api/iot-basic/common/real/dept-tree',
    method: 'get',
  })
}
export const getDeptData = (params) => {
  return request({
    url: '/api/iot-basic/dept/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const deptRemove = (row) => {
  return request({
    url: '/api/iot-basic/dept/remove',
    method: 'post',
    data:row
  })
}
export const getDeptDetails = (params) => {
  return request({
    url: '/api/iot-basic/dept/details',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const deptAdd = (row) => {
  return request({
    url: '/api/iot-basic/dept/save',
    method: 'post',
    data:row
  })
}
export const deptUpdate = (row) => {
  return request({
    url: '/api/iot-basic/dept/update',
    method: 'post',
    data:row
  })
}
export const getSchoolsZtreeData = () => {
  return request({
    url: '/api/iot-basic/common/schools',
    method: 'get',
  })
}

export const reqDeptSnycDev = (params) => {
  return request({
    url: '/api/iot-basic/authsync/details',
    method: 'get',
    params: {...params}
  })
}
export const sendDeptSnycDev = (params) => {
  return request({
    url: '/api/iot-basic/authsync/update',
    method: 'post',
    data: params
  })
}