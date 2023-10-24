import request from '@/router/axios';

export const daystsList = (params) => {
  return request({
    url: '/api/iot-kq/daysts/everyday/collect',
    method: 'get',
    params:{
        ...params
    }
  })
}

export const monthData = (params) => {
  return request({
    url: '/api/iot-kq/daysts/dayrange/collect',
    method: 'get',
    params:{
        ...params
    }
  })
}

export const kqdataAnalyse = (row) => {
  return request({
    url: '/api/iot-kq/daysts/kqdata/analyse',
    method: 'post',
    data:row
  })
}

export const islockUpdate = (row) => {
  return request({
    url: '/api/iot-kq/daysts/islock/update',
    method: 'post',
    data:row
  })
}

export const classWorkUpdate = (row) => {
  return request({
    url: '/api/iot-kq/daysts/working/update',
    method: 'post',
    data:row
  })
}

// export const reissueCard = (row) => {
//   return request({
//     url: '/api/iot-kq/daysts/kqdata/repair',
//     method: 'post',
//     data:row
//   })
// }

export const collectData = (params) => {
  return request({
    url: '/api/iot-kq/daysts/month/collect',
    method: 'get',
    params:{
        ...params
    }
  })
}
export const autoReissueCard = (row) => {
  return request({
    url: '/api/iot-kq/daysts/intelligent/reissue/record',
    method: 'post',
    data:row
  })
}
export const reissueCard = (row) => {
  return request({
    url: '/api/iot-kq/daysts/reissue/record',
    method: 'post',
    data:row
  })
}
export const getDaysDetails = (params) => {
  return request({
    url: '/api/iot-kq/daysts/everyday/details',
    method: 'get',
    params:{
        ...params
    }
  })
}
export const getIndexData = () => {
  return request({
    url: '/api/iot-kq/home/statistics/data',
    method: 'get',
  })
}