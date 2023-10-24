import request from '@/router/axios';

export const reqCheckCardIssue = (row) => {
  return request({
    url: '/api/iot-basic/account/card/issue/check',
    method: 'post',
    data:row
  })
}

export const getAccountData = (params) => {
  return request({
    url: '/api/iot-basic/account/list',
    method: 'get',
    params:{
      ...params
    }
  })
}
export const getCardStateList = () => {
  return request({
    url: '/api/iot-basic/account/card/states',
    method: 'get',
  })
}
export const startCarduse = (ids) => {
  return request({
    url: '/api/iot-basic/account/startcarduse',
    method: 'post',
    data: {
      ids
    }
  })
}
export const stopCarduse = (ids) => {
  return request({
    url: '/api/iot-basic/account/stopcarduse',
    method: 'post',
    data: {
      ids
    }
  })
}
export const reportloss = (empId) => {
  return request({
    url: '/api/iot-basic/account/reportloss',
    method: 'post',
    params: {
      empId
    }
  })
}
export const liftReportloss = (empId) => {
  return request({
    url: '/api/iot-basic/account/lift-reportloss',
    method: 'post',
    params: {
      empId
    }
  })
}
export const damaged = (empId) => {
  return request({
    url: '/api/iot-basic/account/damaged',
    method: 'post',
    params: {
      empId
    }
  })
}
export const recycle = (empId) => {
  return request({
    url: '/api/iot-basic/account/recycle',
    method: 'post',
    params: {
      empId
    }
  })
}
export const getReadCardCipher = (row) => {
  return request({
    url: '/api/iot-basic/account/card/read/cipher',
    method: 'post',
    data:row
  })
}
export const getCleanCardCipher = (row) => {
  return request({
    url: '/api/iot-basic/account/card/clean/cipher',
    method: 'post',
    data:row
  })
}
export const getWriteCardCipher = (row) => {
  return request({
    url: '/api/iot-basic/account/card/write/cipher',
    method: 'post',
    data:row
  })
}
export const issueCard = (row) => {
  return request({
    url: '/api/iot-basic/account/card/issue',
    method: 'post',
    data:row
  })
}
export const updateQrcodeState = (row) => {
  return request({
    url: '/api/iot-basic/account/batch/start/qrcode',
    method: 'post',
    data:row
  })
}
// 获取异动记录
export const getOperateLogList = (current, size, params) => {
  return request({
    url: '/api/iot-basic/account/operate/cardlog',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}
export const getAccountZtreeData = () => {
  return request({
    url: '/api/iot-basic/common/real/dept-grade-class/tree',
    method: 'get',
  })
}
export const getDictListByCode = ( param) => {
  return request({
    url: '/api/iot-basic/dict/list',
    method: 'get',
    params:{
      ...param
    }
  })
}
export const getRechargeReadCardCipher = (d) => {
  return request({
    url: '/api/iot-basic/account/card/recharge/cipher',
    method: 'post',
    data:d
  })
}
// 微信解绑
export const updateWxState = (row) => {
  return request({
    url: '/api/iot-basic/account/batch/cancel/wxbind',
    method: 'post',
    data:row
  })
}
export const checkCardUsable = (params) => {
  return request({
    url: '/api/iot-basic/account/check/card/usable/status',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const getPhotoList = (param) => {
  return request({
    url: '/api/iot-basic//emp/faceurl/log/list',
    method: 'get',
    params:{
      ...param
    }
  })
}
export const agreePhotoAuth = (row) => {
  return request({
    url: '/api/iot-basic//emp/faceurl/log/audit',
    method: 'post',
    data:row
  })
}
export const rejectPhotoAuth = (row) => {
  return request({
    url: '/api/iot-basic//emp/faceurl/log/reject',
    method: 'post',
    data:row
  })
}


// 获取发卡器类型
export const reqCardIssuerType = () => {
  return request({
    url: '/api/iot-basic/common/sys/card-issuer-type',
    method: 'get',
  })
}

export const reqFC2Cipher = (row) => {
  return request({
    url: '/api/iot-basic/account/card/fc2/cipher',
    method: 'post',
    data:row
  })
}
// 获取水电控秘钥
export const reqWECtrlCipher = (row) => {
  return request({
    url: '/api/iot-basic/account/sdctrl/sm2/cipher',
    method: 'post',
    data:row
  })
}
