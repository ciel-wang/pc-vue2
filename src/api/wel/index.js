import request from '@/router/axios';

export const getIndexList = () => {
  return request({
    url: '/api/iot-basic/index',
    method: 'get',
  })
}
export const getTeacherList = (schoolId) => {
  return request({
    url: '/api/iot-basic/index/teacher/sex/group',
    method: 'get',
    params:{
      schoolId
    }
  })
}
export const getStudentList = (schoolId) => {
  return request({
    url: '/api/iot-basic/index/student/sex/group',
    method: 'get',
    params:{
      schoolId
    }
  })
}
export const reqCustomMenu = (params) => {
  return request({
    url: '/api/iot-basic/index/custom/menu',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const sendCustomMenu = (params) => {
  return request({
    url: '/api/iot-basic/index/custom/menu',
    method: 'post',
    data:params
  })
}