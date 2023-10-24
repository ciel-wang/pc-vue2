import request from '@/router/axios';


export const getList = (current, size, params) => {
  return request({
    url: '/api/iot-basic/access/auth/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const deptGetList = (current, size, params) => {
  return request({
    url: '/api/iot-basic/access/auth/dept/list',
    method: 'get',
    params: {
        current,
        size,
      ...params
    }
  })
}
// export const getAreaEquipmentTree = (params) => {
//   return request({
//     url: '/api/blade-basic/access/ic/auth/sequipment-tree',
//     method: 'get',
//     params: {
//       ...params,
//     }
//   })
// }
export const getAreaEquipmentTree = (params) => {
  return request({
    url: '/api/iot-basic/common/real/sequipment-tree',
    method: 'get',
    params: {
      ...params,
    }
  })
}


export const getAreaAllEquipmentTree = (params) => {
  return request({
    url: '/api/iot-basic/common/real/all-sequipment-tree',
    method: 'get',
    params: {
      ...params,
    }
  })
}



export const getAreaEquipmentTreeByFace = (params) => {
  return request({
    url: '/api/iot-basic/common/real/sequipment-face-tree',
    method: 'get',
    params: {
      ...params,
    }
  })
}

export const getDevAreaDoorDetails = (params) => {
  return request({
    url: '/api/iot-basic/access/door/details',
    method: 'get',
    params: {
      ...params,
    }
  })
}


export const getFaceDevList = (params) => {
  return request({
    url: '/api/iot-basic/access/auth/face/devlist',
    method: 'get',
    params: {
      ...params,
    }
  })
}


export const authDown = (row) => {
  return request({
    url: '/api/iot-basic/access/auth/down',
    method: 'post',
    data: row
  })
}

export const deptAuthDown = (row) => {
  return request({
    url: '/api/iot-basic/access/auth/dept/down',
    method: 'post',
    data: row
  })
}

export const faceAuthDown = (row) => {
  return request({
    url: '/api/iot-basic/access/auth/facedown',
    method: 'post',
    data: row
  })
}

export const deptFaceAuthDown = (row) => {
  return request({
    url: '/api/iot-basic/access/auth/dept/facedown',
    method: 'post',
    data: row
  })
}
export const gradeclassAuthDown = (row) => {
  return request({
    url: '/api/iot-basic/access/auth/gradeclass/down',
    method: 'post',
    data: row
  })
}
export const gradeclassFaceAuthDown = (row) => {
  return request({
    url: '/api/iot-basic/access/auth/gradeclass/facedown',
    method: 'post',
    data: row
  })
}