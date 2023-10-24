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
//下载名单列表
export const getEventEmpList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/event/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
//按部门
export const getEventDeptList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/event/dept/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const binTimeStepDown = (row) => {
  return request({
    url: '/api/iot-xf/event/bin/timestep',
    method: 'post',
    data:row
  })
}
export const faceSellerPersonDown = (row) => {
  return request({
    url: '/api/iot-xf/event/face/person/down',
    method: 'post',
    data:row
  })
}
export const faceSellerDeptPersonDown = (row) => {
  return request({
    url: '/api/iot-xf/event/face/dept/person/down',
    method: 'post',
    data:row
  })
}
export const getSelectList = (params) => {
  return request({
    url: '/api/iot-xf/event/selectlist',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const getErrorSelectList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/event/errorselectlist',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const getErrorSelectCount = () => {
  return request({
    url: '/api/iot-xf/event/select/error/event/count',
    method: 'get',
  })
}
export const eventRepeatExecute = (row) => {
  return request({
    url: '/api/iot-xf/event/repeat/execute',
    method: 'post',
    data:row
  })
}
export const removeErrorEvent = (row) => {
  return request({
    url: '/api/iot-xf/event/remove/error/event',
    method: 'post',
    data:row
  })
}
export const againDevEventCreate = (row) => {
  return request({
    url: '/api/iot-xf/event/again/createevent/atauth',
    method: 'post',
    data:row
  })
}
// 按年/班级列表
export const getEventGradeclassList = (params) => {
  return request({
    url: '/api/iot-xf/event/grade/classs/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
// 按年、班级提交
export const gradeclassSubmit = (row) => {
  return request({
    url: '/api/iot-xf/event/face/gradeclass/person/down',
    method: 'post',
    data:row
  })
}