import request from '@/router/axios';

export const getList = (params) => {
  return request({
    url: '/api/iot-basic/access/ic/list',
    method: 'get',
    params: {
      ...params,
    }
  })
}


export const autoSearch = (param) => {
  return request({
    url: '/api/iot-basic/access/ic/autosearch',
    method: 'post',
    params: {
      param
    }
  })
}


export const setDoorArea = (param) => {
  return request({
    url: '/api/iot-basic/access/ic/doorarea',
    method: 'post',
    data: param
  })
}


export const getDoorArea = (param) => {
  return request({
    url: '/api/iot-basic/access/ic/doorarea',
    method: 'get',
    params: {...param}
  })
}



export const setEquipmentIp = (param) => {
  return request({
    url: '/api/iot-basic/access/ic/setip',
    method: 'post',
    data: param
  })
}
export const setServerIp = (param) => {
  return request({
    url: '/api/iot-basic/access/ic/setserverip',
    method: 'post',
    data: param
  })
}

export const synchronizeTime = (param) => {
  return request({
    url: '/api/iot-basic/access/ic/synchronizetime',
    method: 'post',
    data:param
  })
}

//清空设备权限
export const cleanEquitmentAuth = (param) => {
  return request({
    url: '/api/iot-basic/access/ic/cleanauth',
    method: 'post',
    data:param
  })
}

export const readTime = (param) => {
  return request({
    url: '/api/iot-basic/access/ic/readtime',
    method: 'post',
    data:param
  })
}


export const getIcCardById = (id) => {
  return request({
    url: '/api/iot-basic/access/ic/detail',
    method: 'get',
    params: {
      id,
    }
  })
}


export const updateIcCard = (row) => {
  return request({
    url: '/api/iot-basic/access/ic/update',
    method: 'post',
    data: row
  })
}



export const removeDevByIds = (ids) => {
  return request({
    url: '/api/iot-basic/access/ic/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const getSequipmentAllTree = () => {
  return request({
    url: '/api/iot-basic/common/real/sequipment-schema-tree',
    method: 'get',
  })
}

export const devcommandList = (params) => {
  return request({
    url: '/api/iot-basic/access/devcommand/list',
    method: 'get',
    params: {
      ...params,
    }
  })
}

export const downloadIcTimestep = (params) => {
  return request({
    url: '/api/iot-basic/access/ic/download/timestep',
    method: 'post',
    data:params
  })
}
export const reqTimestepList = (params) => {
  return request({
    url: '/api/iot-basic/access/ic/timestep/list',
    method: 'get',
    params: {
      ...params,
    }
  })
}
// 定时任务添加编辑
export const addEditTimedTask = (params) => {
  return request({
    url: '/api/iot-basic/access/ic/task/update',
    method: 'post',
    data:params
  })
}
// 定时任务删除
export const removeTimedTask = (params) => {
  return request({
    url: '/api/iot-basic/access/ic/task/remove',
    method: 'post',
    data:params
  })
}
// 定时任务下载
export const downloadTimedTask = (params) => {
  return request({
    url: '/api/iot-basic/access/ic/task/down',
    method: 'post',
    data:params
  })
}
// 定时任务列表
export const reqTimedTaskList = (params) => {
  return request({
    url: '/api/iot-basic/access/ic/task/list',
    method: 'get',
    params: {
      ...params,
    }
  })
}
// 获取控制器下的门区
export const reqIcDoorDic = (params) => {
  return request({
    url: '/api/iot-basic/access/ic/dev/doors/select/data',
    method: 'get',
    params: {
      ...params,
    }
  })
}
export const sendTimestep = (params) => {
  return request({
    url: '/api/iot-basic/access/ic/timestep/update',
    method: 'post',
    data:params
  })
}
export const removeTimestep = (params) => {
  return request({
    url: '/api/iot-basic/access/ic/timestep/remove',
    method: 'post',
    data:params
  })
}
export const cleanIcTimestepAuth = (param) => {
  return request({
    url: '/api/iot-basic/access/ic/clean/timestep',
    method: 'post',
    data:param
  })
}
// 清空定时任务
export const cleanTimedTask = (params) => {
  return request({
    url: '/api/iot-basic/access/ic/task/clean',
    method: 'post',
    data:params
  })
}
export const sendCtrlmode = (param) => {
  return request({
    url: '/api/iot-basic/access/ic/update/opendoor/ctrlmode',
    method: 'post',
    data:param
  })
}
// 重新上报
export const sendRepairData = (params) => {
  return request({
    url: '/api/iot-basic/access/ic/repair/upload/devdata',
    method: 'post',
    data:params
  })
}