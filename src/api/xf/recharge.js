import request from '@/router/axios';

export const getEmpList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/rechrage/nocard/emplist',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}


export const getSubsidyList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/rechrage/subsidy/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}



export const getRechargePersonInfo = ( params) => {
  return request({
    url: '/api/iot-xf/rechrage/card/personinfo',
    method: 'get',
    params: {
      ...params,
    }
  })
}



export const rechargeAuditEmpList = (current, size, params) => {
  return request({
    url: '/api/iot-xf/rechrage/nocard/audit/emplist',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

 export const preRechargeSubmitData = (row) => {
    return request({
      url: '/api/iot-xf/rechrage/nocard/submit',
      method: 'post',
      data:row
    })
}


//有卡充值提交
 export const haveCardRechargeSubmitData = (row) => {
    return request({
      url: '/api/iot-xf/rechrage/card/submit',
      method: 'post',
      data:row
    })
}

//补贴审核提交
 export const subsidyAuditSubmit = (row) => {
    return request({
      url: '/api/iot-xf/rechrage/subsidy/audit/submit',
      method: 'post',
      data:row
    })
}





 export const rechargeAuditSubmitData = (row) => {
    return request({
      url: '/api/iot-xf/rechrage/nocard/audit/submit',
      method: 'post',
      data:row
    })
}

 export const rechargeAuditRejectData = (row) => {
    return request({
      url: '/api/iot-xf/rechrage/nocard/audit/reject',
      method: 'post',
      data:row
    })
}



 export const subsidyRechargeDelete = (row) => {
    return request({
      url: '/api/iot-xf/rechrage/subsidy/delete',
      method: 'post',
      data:row
    })
}


 export const subsidyRechargeSg = (row) => {
    return request({
      url: '/api/iot-xf/rechrage/subsidy/sg',
      method: 'post',
      data:row
    })
}


//补贴充值- 手工-获取选中部门下的总人数和总金额
 export const subsidyRechargeSgTotal = (row) => {
    return request({
      url: '/api/iot-xf/rechrage/subsidy/sg/total',
      method: 'post',
      data:row
    })
}

//自动充值
 export const subsidyAutoRecharge = (row) => {
    return request({
      url: '/api/iot-xf/rechrage/subsidy/auto/submit',
      method: 'post',
      data:row
    })
}


export const getSubsidyAutoRechargeData = (type) => {
  return request({
    url: '/api/iot-xf/rechrage/subsidy/auto/data',
    method: 'get',
    params: {
      type,
    }
  })
}


export const getSubsidyAllInfo = () => {
  return request({
    url: '/api/iot-xf/rechrage/subsidy/all/audit/info',
    method: 'get',
  })
}




//全部充值
 export const subsidyAuditAllRecharge = (row) => {
    return request({
      url: '/api/iot-xf/rechrage/subsidy/all/audit',
      method: 'post',
      data:row
    })
}
