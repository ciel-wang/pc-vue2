import request from '@/router/axios';

export const reqReportList = (params) => {
  return request({
    url: '/api/blade-system/role/reportlist',
    method: 'get',
    params: {
      ...params
    }
  })
}
export const sendReport = (data) => {
  return request({
    url: '/api/blade-system/role/reportlist/grantauth',
    method: 'post',
    data:data
  })
}

export const getList = (current, size, params) => {
  return request({
    url: '/api/blade-system/role/list',
    method: 'get',
    params: {
      ...params,
      current,
      size,
    }
  })
}

export const getDeptList = () => {
  return request({
    url: '/api/blade-basic/common/real/dept-tree',
    method: 'get',
  })
}


export const grantTree = () => {
  return request({
    url: '/api/blade-system/menu/grant-tree',
    method: 'get',
  })
}

export const grant = (row) => {
  return request({
    url: '/api/blade-system/role/grant',
    method: 'post',
    data: row
  })
}

export const remove = (ids) => {
  return request({
    url: '/api/blade-system/role/remove',
    method: 'post',
    params: {
      ids,
    }
  })
}

export const add = (row) => {
  return request({
    url: '/api/blade-system/role/submit',
    method: 'post',
    data: row
  })
}

export const update = (row) => {
  return request({
    url: '/api/blade-system/role/submit',
    method: 'post',
    data: row
  })
}


export const getRole = (roleIds) => {
  return request({
    url: '/api/blade-system/menu/role-tree-keys',
    method: 'get',
    params: {
      roleIds,
    }
  })
}

export const getRoleTree = (tenantId) => {
  return request({
    url: '/api/blade-system/role/tree',
    method: 'get',
    params: {
      tenantId,
    }
  })
}


export const getRoleDeptTree = (roleId) => {
  return request({
    url: '/api/blade-system/role/depttree',
    method: 'get',
    params: {
      roleId,
    }
  })
}


export const getRoleDevTree = (roleId) => {
  return request({
    url: '/api/blade-system/role/devtree',
    method: 'get',
    params: {
      roleId,
    }
  })
}


export const getRealSellerXfDevTreeData = () => {
  return request({
    url: '/api/blade-basic/common/real/seller-xfdev-tree',
    method: 'get'
  })
}
export const getAppmenuTree = () => {
  return request({
    url: '/api/blade-system/appmenu/tree',
    method: 'get'
  })
}
export const getRoleAppList = (params) => {
  return request({
    url: '/api/blade-system/appmenu/role/list',
    method: 'get',
    params:{
        ...params
    }
  })
}
