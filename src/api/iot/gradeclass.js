import request from '@/router/axios';

export const getGradeclassZtreeData = () => {
  return request({
    url: '/api/iot-basic/grade/class/tree',
    method: 'get',
  })
}
export const getGradeclassData = (params) => {
  return request({
    url: '/api/iot-basic/grade/class/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getGradeData = (params) => {
  return request({
    url: '/api/iot-basic/grade/class/school-gradelist',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getClassData = (params) => {
  return request({
    url: '/api/iot-basic/grade/class/grade-classlist',
    method: 'get',
    params:{
      ...params
    }
  })
}

export const gradeclassAdd = (row) => {
  return request({
    url: '/api/iot-basic/grade/class/add',
    method: 'post',
    data:row
  })
}
export const gradeclassUpdate = (row) => {
  return request({
    url: '/api/iot-basic/grade/class/update',
    method: 'post',
    data:row
  })
}
export const gradeSelectList = (params) => {
  return request({
    url: '/api/iot-basic/grade/class/select/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getGradeclassDetails = (params) => {
  return request({
    url: '/api/iot-basic/grade/class/details',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const gradeclassRemove = (row) => {
  return request({
    url: '/api/iot-basic/grade/class/remove',
    method: 'post',
    data:row
  })
}
export const autoAddClass = (row) => {
  return request({
    url: '/api/iot-basic/grade/class/auto/generate-class',
    method: 'post',
    data:row
  })
}
export const getSchoolGradeList = (params) => {
  return request({
    url: '/api/iot-basic/grade/class/school/grades',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getClassTeacher = (params) => {
  return request({
    url: '/api/iot-basic/grade/class/teachers',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const setClassTeacher = (row) => {
  return request({
    url: '/api/iot-basic/grade/class/setteacher',
    method: 'post',
    data:row
  })
}
