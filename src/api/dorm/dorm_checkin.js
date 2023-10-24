import request from '@/router/axios';

export const getTableData = (params) => {
  return request({
    url: '/api/iot-dorm/dorm/mnglist',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getDormDetails = (params) => {
  return request({
    url: '/api/iot-dorm/live/stulist',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getDormStatistics = (params) => {
  return request({
    url: '/api/iot-dorm/dorm/statistics',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const dormExit = (row) => {
  return request({
    url: '/api/iot-dorm/live/student/exit',
    method: 'post',
    data:row
  })
}
export const getBedContainerSelect = (params) => {
  return request({
    url: '/api/iot-dorm/dorm/bad/selectlist',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getSelectEmpList = (params) => {
  return request({
    url: '/api/iot-dorm/dorm/emplist',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const allotSubmit = (row) => {
  return request({
    url: '/api/iot-dorm/live/student/allot',
    method: 'post',
    data:row
  })
}
export const exchange = (row) => {
  return request({
    url: '/api/iot-dorm/live/student/exchange',
    method: 'post',
    data:row
  })
}
export const getNoliveBed = (params) => {
  return request({
    url: '/api/iot-dorm/live/nolive/bad',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const autoAllot = (row) => {
  return request({
    url: '/api/iot-dorm/live/student/batch/allot',
    method: 'post',
    data:row
  })
}
export const getDormLiveData = (params) => {
  return request({
    url: '/api/iot-dorm/live/dorm/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const autoExchange = (row) => {
  return request({
    url: '/api/iot-dorm/live/student/batch/exchange',
    method: 'post',
    data:row
  })
}
export const autoCheckoutData = (params) => {
  return request({
    url: '/api/iot-dorm/dorm/exitlist',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const autoCheckoutSubmit = (row) => {
  return request({
    url: '/api/iot-dorm/live/student/batch/exit',
    method: 'post',
    data:row
  })
}
export const exchangeRecordDorm = (params) => {
  return request({
    url: '/api/iot-dorm/log/exchange/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const setSuperDorm = (row) => {
  return request({
    url: '/api/iot-dorm/live/dorm/admin',
    method: 'post',
    data:row
  })
}