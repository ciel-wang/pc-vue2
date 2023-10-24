import request from '@/router/axios';

export const getList = (params) => {
  return request({
    url: '/api/iot-basic/access/face/list',
    method: 'get',
    params: {
      ...params,
    }
  })
}

export const getDetails = (param) => {
  return request({
    url: '/api/iot-basic/access/face/details',
    method: 'get',
    params: {...param}
  })
}


export const addFace = (param) => {
  return request({
    url: '/api/iot-basic/access/face/add',
    method: 'post',
    data: param
  })
}

export const setTime = (param) => {
  return request({
    url: '/api/iot-basic/access/face/update/settime',
    method: 'post',
    data: param
  })
}

export const restartDev = (param) => {
  return request({
    url: '/api/iot-basic/access/face/restart',
    method: 'post',
    data: param
  })
}

export const resetDev = (param) => {
  return request({
    url: '/api/iot-basic/access/face/reset',
    method: 'post',
    data: param
  })
}

export const removeDev = (param) => {
  return request({
    url: '/api/iot-basic/access/face/remove',
    method: 'post',
    data: param
  })
}

export const updateFacePwd = (param) => {
  return request({
    url: '/api/iot-basic/access/face/update/facepwd',
    method: 'post',
    data: param
  })
}


export const updateDevFaceBasicCfg = (param) => {
  return request({
    url: '/api/iot-basic/access/face/update/config',
    method: 'post',
    data: param
  })
}

export const updateFace = (param) => {
  return request({
    url: '/api/iot-basic/access/face/update',
    method: 'post',
    data: param
  })
}
export const timeStrategySubmit = (param) => {
  return request({
    url: '/api/iot-basic/access/face/set/face7/time-strategy',
    method: 'post',
    data: param
  })
}
export const getTimeStrategysDic = (param) => {
  return request({
    url: '/api/iot-basic/access/face/get/face7/time-strategys',
    method: 'get',
    params: {...param}
  })
}
export const getTimeStrategysDetails = (param) => {
  return request({
    url: '/api/iot-basic/access/face/get/face7/time-strategy',
    method: 'get',
    params: {...param}
  })
}
export const devDownStrategy = (param) => {
  return request({
    url: '/api/iot-basic/access/face/dev/down/face7/time-strategy',
    method: 'post',
    data: param
  })
}
export const devRemoveStrategy = (param) => {
  return request({
    url: '/api/iot-basic/access/face/remove/face7/time-strategy',
    method: 'post',
    data: param
  })
}

export const updateErrVoice = (param) => {
  return request({
    url: '/api/iot-basic/access/face/update/devface/audio/noauth',
    method: 'post',
    data: param
  })
}