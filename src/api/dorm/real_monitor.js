import request from '@/router/axios';

export const getDormRealData = () => {
  return request({
    url: '/api/iot-dorm/monitor/real',
    method: 'get',
  })
}
export const getPanelDormList = (params) => {
  return request({
    url: '/api/iot-dorm/monitor/real/dorm/panel',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getPanelFloorInfo = () => {
  return request({
    url: '/api/iot-dorm/monitor/real/panel',
    method: 'get',
  })
}
export const getOutStudents = (params) => {
  return request({
    url: '/api/iot-dorm/monitor/real/floor/outemps',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getQjStudents = (params) => {
  return request({
    url: '/api/iot-dorm/monitor/real/floor/qjemps',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getTimecfgData = (params) => {
  return request({
    url: '/api/iot-dorm/sts/timecfg/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const addTimecfg = (row) => {
  return request({
    url: '/api/iot-dorm/sts/timecfg/add',
    method: 'post',
    data:row
  })
}
export const updateTimecfg = (row) => {
  return request({
    url: '/api/iot-dorm/sts/timecfg/update',
    method: 'post',
    data:row
  })
}
export const removeTimecfg = (row) => {
  return request({
    url: '/api/iot-dorm/sts/timecfg/remove',
    method: 'post',
    data:row
  })
}