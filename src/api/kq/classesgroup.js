import request from '@/router/axios';

export const getClassesgroupList = (params) => {
  return request({
    url: '/api/iot-kq/classes/group/list',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const classesgroupAdd = (row) => {
  return request({
    url: '/api/iot-kq/classes/group/add',
    method: 'post',
    data:row
  })
}

export const classesgroupEmplist = (params) => {
  return request({
    url: '/api/iot-kq/classes/group/emplist',
    method: 'get',
    params: {
      ...params
    }
  })
}


export const classesgroupRemove = (row) => {
  return request({
    url: '/api/iot-kq/classes/group/remove',
    method: 'post',
    data:row
  })
}

export const deptKqList = (params) => {
  return request({
    url: '/api/iot-basic/dept/kq/list',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const classesgroupSelectlist = (params) => {
  return request({
    url: '/api/iot-kq/classes/group/selectlist',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const classesgroupDetails = (params) => {
  return request({
    url: '/api/iot-kq/classes/group/details',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const classesgroupUpdate = (row) => {
  return request({
    url: '/api/iot-kq/classes/group/update',
    method: 'post',
    data:row
  })
}

export const classesgroupAddemp = (row) => {
  return request({
    url: '/api/iot-kq/classes/group/addemp',
    method: 'post',
    data:row
  })
}

export const classesgroupSelectedEmp = (params) => {
  return request({
    url: '/api/iot-kq/classes/group/grouplist',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const classesgroupdelemp = (row) => {
  return request({
    url: '/api/iot-kq/classes/group/delemp',
    method: 'post',
    data:row
  })
}

export const getClassesDefault = () => {
  return request({
    url: '/api/iot-kq/classes/group/default',
    method: 'get',
  })
}

export const getClassesDeptList = (params) => {
  return request({
    url: '/api/iot-kq/classes/dept/list',
    method: 'get',
    params:{
        ...params
    }
  })
}

export const classesDeptUpdata = (row) => {
  return request({
    url: '/api/iot-kq/classes/dept/update',
    method: 'post',
    data:row
  })
}
export const getClassPageData = (params) => {
  return request({
    url: '/api/iot-kq/classes/clazz/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const classPageUpdata = (row) => {
  return request({
    url: '/api/iot-kq/classes/clazz/update',
    method: 'post',
    data:row
  })
}
export const classKqList = (row) => {
  return request({
    url: '/api/iot-basic/grade/class//kq/list',
    method: 'get',
    data:row
  })
}