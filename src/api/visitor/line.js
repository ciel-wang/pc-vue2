import request from '@/router/axios';

export const reqVisitorCauses = (params) => {
  return request({
    url: '/api/iot-visitor/line-route/visitor/causes',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const addLine = (row) => {
  return request({
    url: '/api/iot-visitor/line-route/add',
    method: 'post',
    data:row
  })
}

export const updateLine = (row) => {
  return request({
    url: '/api/iot-visitor/line-route/update',
    method: 'post',
    data:row
  })
}

export const removeLine = (ids) => {
  return request({
    url: '/api/iot-visitor/line-route/delete',
    method: 'post',
    data:ids
  })
}

export const getLineList = (current, size, params) => {
  return request({
    url: '/api/iot-visitor/line-route/list',
    method: 'get',
    params: {
      ...params,
      current,
      size
    }
  })
}


export const devmjList = () => {
  return request({
    url: '/api/iot-visitor/dev/mj/select/list',
    method: 'get'
  })
}

// export const areaList = (deptId) => {
//   return request({
//     url: '/api/iot-visitor/area/list/type1',
//     method: 'get',
//     params:{
//         deptId
//     }
//   })
// }

// export const devList = (devAreaId) => {
//   return request({
//     url: '/api/iot-visitor/dev/select/list',
//     method: 'get',
//     params:{
//         devAreaId
//     }
//   })
// }

export const getDetails = (id) => {
  return request({
    url: '/api/iot-visitor/line-route/details',
    method: 'get',
    params:{
        id
    }
  })
}
