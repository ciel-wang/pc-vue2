import request from '@/router/axios';

export const schedulSelectData = () => {
  return request({
    url: '/api/iot-kq/daysts/initdata',
    method: 'get',
  })
}

export const schedulGenerateEdit = (row) => {
  return request({
    url: '/api/iot-kq/daysts/generate',
    method: 'post',
    data:row
  })
}

export const schedulingListData = (params) => {
  return request({
    url: '/api/iot-kq/daysts/list',
    method: 'get',
    params: {
      ...params
    }
  })
}

export const daymodeUpdate = (row) => {
  return request({
    url: '/api/iot-kq/daysts/daymode/update',
    method: 'post',
    data: row
  })
}

export const classesUpdate = (row) => {
  return request({
    url: '/api/iot-kq/daysts/classes/update',
    method: 'post',
    data:row
  })
}
export const copyPaste = (row) => {
  return request({
    url: '/api/iot-kq/daysts/classes/copy-paste',
    method: 'post',
    data:row
  })
}